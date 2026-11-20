import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import prisma from "@/infrastructure/prisma";
import {
    BUSINESS_TZ, PATIENT_TZ, dateKeyIn, floatingFromKey, floatingToKey, formatDateTimeIn,
    parseDateKey, timeToMinutes, toFloating, zonedInstant,
} from "@/lib/time";
import { checkSlot } from "@/services/availability.service";
import { canTransition } from "@/constants/reservations";
import { scheduleSchema, serviceCreateSchema, settingsSchema } from "@/schemas/admin";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GET as remindersCron } from "@/app/api/cron/reminders/route";

vi.mock("@/infrastructure/prisma", () => ({
    default: {
        reservation: { findMany: vi.fn() },
        blockedTime: { findMany: vi.fn() },
        weeklySchedule: { findMany: vi.fn() },
        deviceSession: { updateMany: vi.fn() },
    },
}));
vi.mock("@/utils/email-sender", () => ({
    sendPatientReminderEmail: vi.fn().mockResolvedValue(true),
    sendNewDeviceAlertEmail: vi.fn(),
}));

describe("lib/time", () => {
    it("builds instants from wall-clock time in a given zone", () => {
        expect(zonedInstant("2026-11-20", "18:00", PATIENT_TZ)?.toISOString()).toBe("2026-11-20T17:00:00.000Z");
        expect(zonedInstant("2026-11-20", "17:00", BUSINESS_TZ)?.toISOString()).toBe("2026-11-20T17:00:00.000Z");
        expect(zonedInstant("2026-06-20", "17:00", BUSINESS_TZ)?.toISOString()).toBe("2026-06-20T16:00:00.000Z");
        expect(zonedInstant("2026-11-20", "25:00", PATIENT_TZ)).toBeNull();
        expect(zonedInstant("20-11-2026", "18:00", PATIENT_TZ)).toBeNull();
    });

    it("gives the calendar day of an instant per zone", () => {
        const lateEvening = new Date("2026-11-20T23:30:00Z"); // 23:30 London, 00:30 Warsaw next day
        expect(dateKeyIn(lateEvening, BUSINESS_TZ)).toBe("2026-11-20");
        expect(dateKeyIn(lateEvening, PATIENT_TZ)).toBe("2026-11-21");
    });

    it("floating dates expose the zone's wall clock through local getters", () => {
        const f = toFloating(new Date("2026-11-20T17:30:00Z"), PATIENT_TZ);
        expect([f.getDate(), f.getHours(), f.getMinutes()]).toEqual([20, 18, 30]);
        expect(floatingToKey(floatingFromKey("2026-03-29"))).toBe("2026-03-29");
    });

    it("validates keys and times", () => {
        expect(parseDateKey("2026-02-30", PATIENT_TZ)).toBeNull();
        expect(parseDateKey("2026-02-28", PATIENT_TZ)?.toISODate()).toBe("2026-02-28");
        expect(timeToMinutes("17:30")).toBe(1050);
        expect(timeToMinutes("abc")).toBeNull();
        expect(formatDateTimeIn(new Date("2026-01-05T12:00:00Z"), PATIENT_TZ).formattedDate).toBe("5 stycznia 2026");
    });
});

describe("checkSlot", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-01T08:00:00Z")); // Monday
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
        vi.mocked(prisma.blockedTime.findMany).mockResolvedValue([]);
        vi.mocked(prisma.weeklySchedule.findMany).mockResolvedValue([]); // default: Mon 17–20 London
    });
    afterEach(() => vi.useRealTimers());

    it("public: accepts slots of the London schedule", async () => {
        // 17:00 London (BST) = 16:00 UTC = 18:00 Warsaw
        expect(await checkSlot("2026-06-01T16:00:00Z", 50)).toEqual({ ok: true });
        expect(await checkSlot("2026-06-01T18:00:00Z", 50)).toEqual({ ok: true }); // last slot 19:00 London
    });

    it("public: rejects times outside hours, off the grid, in the past, or too far ahead", async () => {
        expect(await checkSlot("2026-06-01T15:00:00Z", 50)).toEqual({ ok: false, reason: "OUTSIDE_HOURS" });
        expect(await checkSlot("2026-06-01T19:00:00Z", 50)).toEqual({ ok: false, reason: "OUTSIDE_HOURS" });
        expect(await checkSlot("2026-06-01T16:30:00Z", 50)).toEqual({ ok: false, reason: "OFF_GRID" });
        expect(await checkSlot("2026-05-25T16:00:00Z", 50)).toEqual({ ok: false, reason: "PAST" });
        expect(await checkSlot("2026-08-03T16:00:00Z", 50)).toEqual({ ok: false, reason: "HORIZON" });
        expect(await checkSlot("nonsense", 50)).toEqual({ ok: false, reason: "INVALID" });
    });

    it("rejects overlaps using durations, and admin mode skips schedule rules only", async () => {
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([
            { date: new Date("2026-06-01T16:00:00Z"), service: { duration: 50 } },
        ] as never);

        expect(await checkSlot("2026-06-01T16:00:00Z", 50)).toEqual({ ok: false, reason: "BUSY" });
        // admin can book outside hours / at odd minutes…
        expect(await checkSlot("2026-06-01T20:15:00Z", 50, prisma, { mode: "admin" })).toEqual({ ok: true });
        // …but never on top of another visit
        expect(await checkSlot("2026-06-01T16:30:00Z", 50, prisma, { mode: "admin" })).toEqual({ ok: false, reason: "BUSY" });
    });
});

describe("rules and validation", () => {
    it("status transitions", () => {
        expect(canTransition("PENDING", "PAID")).toBe(true);
        expect(canTransition("PAID", "COMPLETED")).toBe(true);
        expect(canTransition("PAID", "PENDING")).toBe(false);
        expect(canTransition("PENDING", "COMPLETED")).toBe(false);
        expect(canTransition("CANCELLED", "PAID")).toBe(false);
    });

    it("schedule must have 7 unique days with valid, ordered times", () => {
        const week = [0, 1, 2, 3, 4, 5, 6].map((d) => ({ dayOfWeek: d, startTime: "17:00", endTime: "20:00", isActive: true }));
        expect(scheduleSchema.safeParse({ schedules: week }).success).toBe(true);
        expect(scheduleSchema.safeParse({ schedules: week.map((d, i) => (i === 1 ? { ...d, startTime: "abc" } : d)) }).success).toBe(false);
        expect(scheduleSchema.safeParse({ schedules: week.map((d, i) => (i === 1 ? { ...d, endTime: "09:00" } : d)) }).success).toBe(false);
        expect(scheduleSchema.safeParse({ schedules: week.map((d) => ({ ...d, dayOfWeek: 1 })) }).success).toBe(false);
    });

    it("services reject negative price/duration; settings links must be http(s)", () => {
        expect(serviceCreateSchema.safeParse({ name: "Konsultacja", duration: 50, price: 150 }).success).toBe(true);
        expect(serviceCreateSchema.safeParse({ name: "Konsultacja", duration: -5, price: 150 }).success).toBe(false);
        expect(serviceCreateSchema.safeParse({ name: "Konsultacja", duration: 50, price: -1 }).success).toBe(false);
        expect(settingsSchema.safeParse({ instagramUrl: "https://instagram.com/x" }).success).toBe(true);
        expect(settingsSchema.safeParse({ instagramUrl: "" }).success).toBe(true);
        expect(settingsSchema.safeParse({ instagramUrl: "javascript:alert(1)" }).success).toBe(false);
    });
});

describe("sessions and crons", () => {
    it("signing out invalidates the server-side device session", async () => {
        vi.mocked(prisma.deviceSession.updateMany).mockResolvedValue({ count: 1 });
        await authOptions.events!.signOut!({ token: { sessionId: "s1" } } as never);
        expect(prisma.deviceSession.updateMany).toHaveBeenCalledWith({ where: { id: "s1", isValid: true }, data: { isValid: false } });
    });

    it("reminders go only to paid visits, for tomorrow in Polish time", async () => {
        process.env.CRON_SECRET = "s3cret";
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-20T18:00:00Z"));
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);

        await remindersCron(new Request("http://x", { headers: { authorization: "Bearer s3cret" } }));
        const where = vi.mocked(prisma.reservation.findMany).mock.calls.at(-1)![0]!.where as {
            status: string; date: { gte: Date; lte: Date };
        };
        expect(where.status).toBe("PAID");
        expect(where.date.gte.toISOString()).toBe("2026-11-20T23:00:00.000Z"); // 21 Nov 00:00 Warsaw
        vi.useRealTimers();
        delete process.env.CRON_SECRET;
    });
});

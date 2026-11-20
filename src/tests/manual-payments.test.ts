import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendAdminCancellationAlert, sendCancellationEmail, sendMagicLinkEmail, sendRescheduleEmail } from "@/utils/email-sender";
import { PATCH as adminPatch } from "@/app/api/admin/reservations/[id]/route";
import { PATCH as adminReschedule } from "@/app/api/admin/reservations/new-date/[id]/route";
import { POST as patientCancel } from "@/app/api/patient/reservation/cancel/route";
import { GET as cleanupCron } from "@/app/api/cron/cleanup-pending/route";
import { MagicLinkEmail } from "@/emails/MagicLink";
import { PENDING_HOLD_HOURS, PENDING_HOLD_MS, realClinicPhone, PLACEHOLDER_CLINIC_PHONE } from "@/constants/reservations";
import { slotBlockingReservationWhere } from "@/services/availability.service";

vi.mock("@/infrastructure/prisma", () => {
    const db = {
        reservation: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
        blockedTime: { findMany: vi.fn() },
        weeklySchedule: { findMany: vi.fn() },
        systemLog: { create: vi.fn() },
        $transaction: vi.fn(),
    };
    return { default: db };
});
vi.mock("@/lib/requireAdmin", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/utils/email-sender", () => ({
    sendMagicLinkEmail: vi.fn().mockResolvedValue(true),
    sendCancellationEmail: vi.fn().mockResolvedValue(true),
    sendRescheduleEmail: vi.fn().mockResolvedValue(true),
    sendAdminCancellationAlert: vi.fn().mockResolvedValue(true),
    getClinicNotificationEmail: vi.fn().mockResolvedValue("clinic@example.com"),
}));

const TOKEN = "3f2b8c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f";
const DAY = 24 * 60 * 60 * 1000;
const base = (over: Record<string, unknown> = {}) => ({
    id: "r1", email: "p@x.pl", patientName: "Jan Kowalski", magicToken: TOKEN, amountPaid: 150,
    isManual: false, createdAt: new Date(), date: new Date(Date.now() + 5 * DAY),
    service: { name: "Konsultacja", price: 150, duration: 50 },
    ...over,
});
const patch = (status: string) =>
    adminPatch(new Request("http://x", { method: "PATCH", body: JSON.stringify({ status }) }), { params: Promise.resolve({ id: "r1" }) });
const logActions = () => vi.mocked(prisma.systemLog.create).mock.calls.map((c) => c[0].data.action);

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ email: "admin@x.pl", sessionId: "s1" });
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => (fn as (tx: unknown) => unknown)(prisma));
    vi.mocked(prisma.reservation.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
    vi.mocked(prisma.blockedTime.findMany).mockResolvedValue([]);
    vi.mocked(prisma.weeklySchedule.findMany).mockResolvedValue([]);
    vi.mocked(sendMagicLinkEmail).mockResolvedValue(true);
});

describe("Admin status changes", () => {
    it("PENDING → PAID: conditional update + confirmation e-mail", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PENDING" }) as never);

        const res = await patch("PAID");
        expect(res.status).toBe(200);
        expect(prisma.reservation.updateMany).toHaveBeenCalledWith({ where: { id: "r1", status: "PENDING" }, data: { status: "PAID" } });
        expect(sendMagicLinkEmail).toHaveBeenCalledWith(expect.objectContaining({ email: "p@x.pl", status: "PAID", magicToken: TOKEN }));
        expect(logActions()).toContain("PŁATNOŚĆ_ZAKSIĘGOWANA_RĘCZNIE");
    });

    it("reports a warning when the confirmation e-mail fails", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PENDING" }) as never);
        vi.mocked(sendMagicLinkEmail).mockResolvedValue(false);

        const body = await (await patch("PAID")).json();
        expect(body.warning).toMatch(/Nie udało się wysłać/);
    });

    it.each([
        ["PAID", "PENDING"],
        ["PENDING", "COMPLETED"],
        ["COMPLETED", "PAID"],
        ["CANCELLED", "PAID"],
    ])("rejects %s → %s", async (from, to) => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: from }) as never);
        const res = await patch(to);
        expect(res.status).toBe(400);
        expect(prisma.reservation.updateMany).not.toHaveBeenCalled();
    });

    it("refuses to confirm an expired-hold booking whose slot was taken meanwhile", async () => {
        const expired = base({ status: "PENDING", createdAt: new Date(Date.now() - PENDING_HOLD_MS - 60_000) });
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(expired as never);
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([
            { date: expired.date, service: { duration: 50 } },
        ] as never);

        const res = await patch("PAID");
        expect(res.status).toBe(409);
        expect(prisma.reservation.updateMany).not.toHaveBeenCalled();
        // the overlap query excludes the reservation itself
        expect(vi.mocked(prisma.reservation.findMany).mock.calls[0][0]!.where).toMatchObject({ id: { not: "r1" } });
    });

    it("returns 409 when the status changed concurrently", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PENDING" }) as never);
        vi.mocked(prisma.reservation.updateMany).mockResolvedValue({ count: 0 });

        expect((await patch("PAID")).status).toBe(409);
        expect(sendMagicLinkEmail).not.toHaveBeenCalled();
    });

    it("cancelling a PAID visit flags a manual refund", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PAID" }) as never);

        expect((await patch("CANCELLED")).status).toBe(200);
        expect(logActions()).toContain("WYMAGANY_ZWROT_RĘCZNY");
        expect(vi.mocked(sendCancellationEmail).mock.calls[0][0].reason).toMatch(/zwrotu/);
    });
});

describe("Admin reschedule", () => {
    const reschedule = (date: string) =>
        adminReschedule(new Request("http://x", { method: "PATCH", body: JSON.stringify({ date }) }), { params: Promise.resolve({ id: "r1" }) });

    it("rejects an overlap with another visit (not only an identical start time)", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PAID" }) as never);
        const other = new Date(Date.now() + 2 * DAY);
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([{ date: other, service: { duration: 50 } }] as never);

        const res = await reschedule(new Date(other.getTime() + 30 * 60_000).toISOString());
        expect(res.status).toBe(409);
        expect(prisma.reservation.update).not.toHaveBeenCalled();
    });

    it("sends the reschedule e-mail with the real status and the patient's link", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PAID" }) as never);
        const newDate = new Date(Date.now() + 3 * DAY);
        vi.mocked(prisma.reservation.update).mockResolvedValue(base({ status: "PAID", date: newDate }) as never);

        expect((await reschedule(newDate.toISOString())).status).toBe(200);
        expect(sendRescheduleEmail).toHaveBeenCalledWith(expect.objectContaining({ status: "PAID", magicToken: TOKEN }));
    });

    it("refuses to move cancelled visits and unknown ids", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce(base({ status: "CANCELLED" }) as never);
        expect((await reschedule(new Date(Date.now() + DAY).toISOString())).status).toBe(400);
        vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce(null as never);
        expect((await reschedule(new Date(Date.now() + DAY).toISOString())).status).toBe(404);
        expect((await reschedule("not-a-date")).status).toBe(400);
    });
});

describe("Patient cancellation", () => {
    const cancel = () => patientCancel(new Request("http://x", { method: "POST", body: JSON.stringify({ token: TOKEN }) }));

    it("PAID more than 24h ahead → manual refund logged and the clinic is notified", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PAID", date: new Date(Date.now() + 3 * DAY) }) as never);

        expect((await cancel()).status).toBe(200);
        expect(prisma.reservation.updateMany).toHaveBeenCalledWith({ where: { id: "r1", status: "PAID" }, data: { status: "CANCELLED" } });
        expect(logActions()).toContain("WYMAGANY_ZWROT_RĘCZNY");
        expect(sendAdminCancellationAlert).toHaveBeenCalledWith(expect.objectContaining({ refundDue: true, amount: 150 }));
    });

    it("cannot cancel a visit that already took place", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue(base({ status: "PAID", date: new Date(Date.now() - DAY) }) as never);

        expect((await cancel()).status).toBe(400);
        expect(prisma.reservation.updateMany).not.toHaveBeenCalled();
    });
});

describe("Cleanup cron (unpaid reservations)", () => {
    beforeEach(() => { process.env.CRON_SECRET = "s3cret"; });
    afterEach(() => { delete process.env.CRON_SECRET; });

    const run = () => cleanupCron(new Request("http://x", { headers: { authorization: "Bearer s3cret" } }));

    it(`uses a ${PENDING_HOLD_HOURS}h hold for online bookings only`, async () => {
        const before = Date.now();
        await run();

        const where = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]!.where as {
            OR: [{ isManual: boolean; createdAt: { lt: Date } }];
        };
        expect(where.OR[0].isManual).toBe(false);
        const cutoff = where.OR[0].createdAt.lt.getTime();
        expect(Math.abs(before - cutoff - PENDING_HOLD_MS)).toBeLessThan(1000);
        expect(PENDING_HOLD_HOURS).toBe(72);
    });

    it("e-mails only patients whose upcoming booking it actually cancelled", async () => {
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([
            base({ id: "future", date: new Date(Date.now() + 2 * DAY) }),
            base({ id: "past", date: new Date(Date.now() - DAY) }),
            base({ id: "paidMeanwhile", date: new Date(Date.now() + 2 * DAY) }),
        ] as never);
        vi.mocked(prisma.reservation.updateMany)
            .mockResolvedValueOnce({ count: 1 })
            .mockResolvedValueOnce({ count: 1 })
            .mockResolvedValueOnce({ count: 0 }); // marked as paid in the meantime

        const body = await (await run()).json();
        expect(body.cancelledCount).toBe(2);
        expect(sendCancellationEmail).toHaveBeenCalledTimes(1);
        expect(prisma.reservation.updateMany).toHaveBeenCalledWith({ where: { id: "paidMeanwhile", status: "PENDING" }, data: { status: "CANCELLED" } });
    });

    it("rejects calls without the cron secret", async () => {
        expect((await cleanupCron(new Request("http://x"))).status).toBe(401);
    });
});

describe("Availability hold", () => {
    it("online PENDING bookings stop blocking after the hold; manual ones never expire", () => {
        const now = new Date("2026-11-20T12:00:00Z");
        const where = slotBlockingReservationWhere(now) as { NOT: { isManual: boolean; createdAt: { lt: Date } } };
        expect(now.getTime() - where.NOT.createdAt.lt.getTime()).toBe(PENDING_HOLD_MS);
        expect(where.NOT.isManual).toBe(false);
    });
});

describe("Reservation e-mail template", () => {
    const props = { patientName: "Jan Kowalski", date: "1 grudnia", time: "17:00", serviceName: "Konsultacja", magicLink: "https://x/y" };

    it("PENDING: asks the patient to contact the clinic, shows contact, no bank account", () => {
        const { container } = render(MagicLinkEmail({ ...props, status: "PENDING", clinicPhone: "+48 500 600 700", clinicEmail: "kontakt@x.pl", price: 150 }));
        const text = container.textContent || "";
        expect(text).toMatch(/skontaktuj się ze mną w sprawie płatności/);
        expect(text).toContain("+48 500 600 700");
        expect(text).toContain("kontakt@x.pl");
        expect(text).toContain("150 zł");
        expect(text).toContain("(czas polski)");
        expect(text).toContain(`${PENDING_HOLD_HOURS} godzinach`);
        expect(text).not.toMatch(/przelew|numer konta/i);
    });

    it("PAID: confirms the visit and has no payment request", () => {
        const { container } = render(MagicLinkEmail({ ...props, status: "PAID" }));
        const text = container.textContent || "";
        expect(text).toMatch(/Płatność została zaksięgowana/);
        expect(text).not.toMatch(/skontaktuj się ze mną w sprawie płatności/);
    });

    it("never shows the placeholder clinic phone", () => {
        expect(realClinicPhone(PLACEHOLDER_CLINIC_PHONE)).toBeNull();
        expect(realClinicPhone(" +48 500 600 700 ")).toBe("+48 500 600 700");
    });
});

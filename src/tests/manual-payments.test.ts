import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendCancellationEmail, sendMagicLinkEmail } from "@/utils/email-sender";
import { PATCH as adminPatch } from "@/app/api/admin/reservations/[id]/route";
import { POST as patientCancel } from "@/app/api/patient/reservation/cancel/route";
import { GET as cleanupCron } from "@/app/api/cron/cleanup-pending/route";
import { MagicLinkEmail } from "@/emails/MagicLink";
import { PENDING_HOLD_HOURS, PENDING_HOLD_MS } from "@/constants/reservations";
import { slotBlockingReservationWhere } from "@/services/availability.service";

vi.mock("@/infrastructure/prisma", () => ({
    default: {
        reservation: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
        systemLog: { create: vi.fn() },
    },
}));
vi.mock("@/lib/requireAdmin", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/utils/email-sender", () => ({
    sendMagicLinkEmail: vi.fn(),
    sendCancellationEmail: vi.fn(),
}));

const TOKEN = "3f2b8c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f";
const DAY = 24 * 60 * 60 * 1000;
const baseReservation = {
    id: "r1", email: "p@x.pl", patientName: "Jan Kowalski", magicToken: TOKEN,
    service: { name: "Konsultacja", price: 150 },
};
const patch = (status: string) =>
    adminPatch(new Request("http://x", { method: "PATCH", body: JSON.stringify({ status }) }), { params: Promise.resolve({ id: "r1" }) });
const logActions = () => vi.mocked(prisma.systemLog.create).mock.calls.map((c) => c[0].data.action);

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ email: "admin@x.pl", sessionId: "s1" });
});

describe("Admin marks payment manually", () => {
    it("PENDING → PAID sends the patient a confirmation e-mail", async () => {
        const date = new Date(Date.now() + 5 * DAY);
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue({ ...baseReservation, status: "PENDING", date } as never);
        vi.mocked(prisma.reservation.update).mockResolvedValue({ ...baseReservation, status: "PAID", date } as never);

        expect((await patch("PAID")).status).toBe(200);
        expect(sendMagicLinkEmail).toHaveBeenCalledWith(expect.objectContaining({ email: "p@x.pl", status: "PAID", magicToken: TOKEN }));
        expect(logActions()).toContain("PŁATNOŚĆ_ZAKSIĘGOWANA_RĘCZNIE");
    });

    it("PAID → COMPLETED does not resend the payment confirmation", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue({ ...baseReservation, status: "PAID", date: new Date() } as never);
        vi.mocked(prisma.reservation.update).mockResolvedValue({ ...baseReservation, status: "COMPLETED", date: new Date() } as never);
        await patch("COMPLETED");
        expect(sendMagicLinkEmail).not.toHaveBeenCalled();
    });

    it("cancelling a PAID visit flags a manual refund instead of calling a payment provider", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue({ ...baseReservation, status: "PAID", date: new Date() } as never);
        vi.mocked(prisma.reservation.update).mockResolvedValue({ ...baseReservation, status: "CANCELLED", date: new Date() } as never);

        expect((await patch("CANCELLED")).status).toBe(200);
        expect(logActions()).toContain("WYMAGANY_ZWROT_RĘCZNY");
        expect(vi.mocked(sendCancellationEmail).mock.calls[0][0].reason).toMatch(/zwrotu/);
    });
});

describe("Patient cancellation", () => {
    it("PAID more than 24h ahead → manual refund logged, reservation cancelled", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue({ ...baseReservation, status: "PAID", date: new Date(Date.now() + 3 * DAY) } as never);
        vi.mocked(prisma.reservation.update).mockResolvedValue({ ...baseReservation, status: "CANCELLED", date: new Date() } as never);

        const res = await patientCancel(new Request("http://x", { method: "POST", body: JSON.stringify({ token: TOKEN }) }));
        expect(res.status).toBe(200);
        expect(logActions()).toContain("WYMAGANY_ZWROT_RĘCZNY");
        expect(prisma.reservation.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "CANCELLED" } }));
    });
});

describe("Cleanup cron (unpaid reservations)", () => {
    beforeEach(() => { process.env.CRON_SECRET = "s3cret"; });
    afterEach(() => { delete process.env.CRON_SECRET; });

    const run = () => cleanupCron(new Request("http://x", { headers: { authorization: "Bearer s3cret" } }));

    it(`uses a ${PENDING_HOLD_HOURS}h hold and only cancels still-PENDING reservations`, async () => {
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
        const before = Date.now();
        await run();

        const where = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]!.where as { OR: [{ createdAt: { lt: Date } }] };
        const cutoff = where.OR[0].createdAt.lt.getTime();
        expect(before - cutoff).toBeGreaterThanOrEqual(PENDING_HOLD_MS - 1000);
        expect(before - cutoff).toBeLessThanOrEqual(PENDING_HOLD_MS + 1000);
        expect(PENDING_HOLD_HOURS).toBe(72);
    });

    it("e-mails patients whose upcoming slot was released, not past ones", async () => {
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([
            { ...baseReservation, id: "future", date: new Date(Date.now() + 2 * DAY) },
            { ...baseReservation, id: "past", date: new Date(Date.now() - DAY) },
        ] as never);
        vi.mocked(prisma.reservation.updateMany).mockResolvedValue({ count: 2 });

        expect((await run()).status).toBe(200);
        expect(prisma.reservation.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["future", "past"] }, status: "PENDING" },
            data: { status: "CANCELLED" },
        });
        expect(sendCancellationEmail).toHaveBeenCalledOnce();
    });

    it("rejects calls without the cron secret", async () => {
        expect((await cleanupCron(new Request("http://x"))).status).toBe(401);
    });
});

describe("Availability hold", () => {
    it("PENDING reservations stop blocking a slot after the hold period", () => {
        const now = new Date("2026-11-20T12:00:00Z");
        const where = slotBlockingReservationWhere(now) as { NOT: { createdAt: { lt: Date } } };
        expect(now.getTime() - where.NOT.createdAt.lt.getTime()).toBe(PENDING_HOLD_MS);
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
        expect(text).toContain(`${PENDING_HOLD_HOURS} godzinach`);
        expect(text).not.toMatch(/przelew|numer konta/i);
    });

    it("PAID: confirms the visit and has no payment request", () => {
        const { container } = render(MagicLinkEmail({ ...props, status: "PAID" }));
        const text = container.textContent || "";
        expect(text).toMatch(/Płatność została zaksięgowana/);
        expect(text).not.toMatch(/skontaktuj się ze mną w sprawie płatności/);
    });
});

describe("Clinic phone placeholder", () => {
    it("is never shown to patients", async () => {
        const { realClinicPhone, PLACEHOLDER_CLINIC_PHONE } = await import("@/constants/reservations");
        expect(realClinicPhone(PLACEHOLDER_CLINIC_PHONE)).toBeNull();
        expect(realClinicPhone("  ")).toBeNull();
        expect(realClinicPhone(" +48 500 600 700 ")).toBe("+48 500 600 700");
    });
});

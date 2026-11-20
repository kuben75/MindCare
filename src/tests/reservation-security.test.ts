import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/reservations/route";
import prisma from "@/infrastructure/prisma";
import { checkReservationRateLimit } from "@/lib/rate-limit";
import { checkSlot } from "@/services/availability.service";

vi.mock("@/lib/rate-limit", () => ({
    checkReservationRateLimit: vi.fn(),
}));

vi.mock("@/services/availability.service", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/services/availability.service")>()),
    checkSlot: vi.fn(),
}));

vi.mock("@/utils/email-sender", () => ({
    sendMagicLinkEmail: vi.fn(),
    sendNewReservationAdminAlert: vi.fn(),
    getAdminNotificationEmail: vi.fn(() => Promise.resolve("admin@test.pl")),
}));

vi.mock("@/infrastructure/prisma", () => ({
    default: {
        service: { findUnique: vi.fn() },
        clinicSettings: { findFirst: vi.fn() },
        systemLog: { create: vi.fn() },
        $transaction: vi.fn(),
    },
}));

describe("Public Reservations Security", () => {
    const validPayload = {
        patientName: "Jan Kowalski",
        email: "jan@example.com",
        phone: "+48123456789",
        serviceId: "11111111-1111-4111-8111-111111111111",
        date: new Date(Date.now() + 86400000).toISOString(),
        termsAccepted: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(checkReservationRateLimit).mockResolvedValue({ success: true, remaining: 2 });
        vi.mocked(prisma.service.findUnique).mockResolvedValue({
            id: validPayload.serviceId,
            name: "Konsultacja",
            duration: 50,
            price: 200,
            isActive: true,
        } as any);
    });

    it("zwraca 429 po przekroczeniu limitu zapytań z jednego IP", async () => {
        vi.mocked(checkReservationRateLimit).mockResolvedValue({ success: false, remaining: 0 });

        const req = new Request("http://localhost/api/reservations", {
            method: "POST",
            headers: { "x-forwarded-for": "1.2.3.4" },
            body: JSON.stringify(validPayload),
        });

        const res = await POST(req);
        expect(res.status).toBe(429);
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("zwraca 409, gdy termin jest poza grafikiem, zablokowany lub zajęty", async () => {
        vi.mocked(checkSlot).mockResolvedValue({ ok: false, reason: "OUTSIDE_HOURS" });
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
            const tx = {
                reservation: {
                    count: vi.fn().mockResolvedValue(0),
                    create: vi.fn(),
                },
            };
            return fn(tx);
        });

        const req = new Request("http://localhost/api/reservations", {
            method: "POST",
            body: JSON.stringify(validPayload),
        });

        const res = await POST(req);
        expect(res.status).toBe(409);
    });

    it("zwraca 409 przy konflikcie serializacji bazy (równoległa rezerwacja tego samego slotu)", async () => {
        vi.mocked(prisma.$transaction).mockRejectedValue({ code: "P2034" });

        const req = new Request("http://localhost/api/reservations", {
            method: "POST",
            body: JSON.stringify(validPayload),
        });

        const res = await POST(req);
        expect(res.status).toBe(409);
    });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/infrastructure/prisma';
import { POST } from "@/app/api/reservations/route";
import { checkSlot } from '@/services/availability.service';
import { Reservation, Service } from "@prisma/client";

vi.mock('@/infrastructure/prisma', () => {
    const mockPrisma = {
        service: { findUnique: vi.fn() },
        reservation: { count: vi.fn(), create: vi.fn() },
        clinicSettings: { findFirst: vi.fn() },
        systemLog: { count: vi.fn(), create: vi.fn() },
        $transaction: vi.fn(),
    };
    return { default: mockPrisma };
});

vi.mock('@/services/availability.service', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/services/availability.service')>()),
    checkSlot: vi.fn()
}));

vi.mock('@/utils/email-sender', () => ({
    sendMagicLinkEmail: vi.fn().mockResolvedValue(true),
    sendNewReservationAdminAlert: vi.fn().mockResolvedValue(true),
    getAdminNotificationEmail: vi.fn().mockResolvedValue('admin@test.pl')
}));

describe('Endpoint POST /api/reservations', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(prisma.systemLog.count).mockResolvedValue(0);
        vi.mocked(prisma.reservation.count).mockResolvedValue(0);
        vi.mocked(prisma.clinicSettings.findFirst).mockResolvedValue(null);
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
            if (typeof fn === 'function') {
                return fn(prisma);
            }
            return Promise.all(fn as Promise<unknown>[]);
        });
    });

    it('Zwraca 409 Conflict jeśli wybrany termin nakłada się na inną wizytę (Overbooking Protection)', async () => {
        vi.mocked(prisma.service.findUnique).mockResolvedValue({
            id: 'srv_1',
            name: 'Konsultacja',
            duration: 60,
            price: 200,
            isActive: true
        } as Service);

        // Symulacja: slot jest zajęty
        vi.mocked(checkSlot).mockResolvedValue({ ok: false, reason: 'BUSY' });

        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const req = new Request('http://localhost/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                patientName: 'Jan Kowalski',
                email: 'jan@test.pl',
                phone: '123456789',
                serviceId: 'srv_1',
                date: futureDate,
                termsAccepted: true
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(409);
        expect(data.error).toContain('ten termin jest niedostępny lub został właśnie zajęty');
    });

    it('Tworzy rezerwację PENDING i natychmiast odsyła pacjenta do strony sukcesu (bez bramki Stripe)', async () => {
        vi.mocked(prisma.service.findUnique).mockResolvedValue({
            id: 'srv_1',
            name: 'Konsultacja',
            duration: 60,
            price: 200,
            isActive: true
        } as Service);

        vi.mocked(checkSlot).mockResolvedValue({ ok: true });

        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        vi.mocked(prisma.reservation.create).mockResolvedValue({
            id: 'nowa_rezerwacja',
            patientName: 'Jan Kowalski',
            email: 'jan@test.pl',
            phone: '123456789',
            date: new Date(futureDate),
            serviceId: 'srv_1',
            status: 'PENDING',
            magicToken: 'magic_token_abc_123',
            hasAcceptedTerms: true,
            service: { name: 'Konsultacja', price: 200, duration: 60 }
        } as unknown as Reservation);

        const req = new Request('http://localhost/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                patientName: 'Jan Kowalski',
                email: 'jan@test.pl',
                phone: '123456789',
                serviceId: 'srv_1',
                date: futureDate,
                termsAccepted: true
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data.url).toContain('/reservation/success?token=magic_token_abc_123');
        expect(prisma.reservation.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: 'PENDING',
                    serviceId: 'srv_1'
                })
            })
        );
    });
});
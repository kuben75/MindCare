import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/infrastructure/prisma';
import { POST } from "@/app/api/reservations/route";
import { isSlotAvailable } from '@/services/availability.service';
import { Reservation, Service } from "@prisma/client";

vi.mock('@/infrastructure/prisma', () => ({
    default: {
        service: { findUnique: vi.fn() },
        reservation: { create: vi.fn() },
        systemLog: { create: vi.fn() }
    }
}));

vi.mock('@/services/availability.service', () => ({
    isSlotAvailable: vi.fn()
}));

vi.mock('@/utils/email-sender', () => ({
    sendMagicLinkEmail: vi.fn().mockResolvedValue(true),
    sendNewReservationAdminAlert: vi.fn().mockResolvedValue(true),
    getAdminNotificationEmail: vi.fn().mockResolvedValue('admin@test.pl')
}));

describe('Endpoint POST /api/reservations', () => {

    beforeEach(() => {
        vi.clearAllMocks();
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
        vi.mocked(isSlotAvailable).mockResolvedValue(false);

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
        expect(data.error).toContain('ten termin został właśnie zajęty');
    });

    it('Tworzy rezerwację PENDING i natychmiast odsyła pacjenta do strony sukcesu (bez bramki Stripe)', async () => {
        vi.mocked(prisma.service.findUnique).mockResolvedValue({
            id: 'srv_1',
            name: 'Konsultacja',
            duration: 60,
            price: 200,
            isActive: true
        } as Service);

        // Symulacja: slot jest wolny
        vi.mocked(isSlotAvailable).mockResolvedValue(true);

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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/infrastructure/prisma';
import { stripe } from '@/infrastructure/stripe';
import { POST } from "@/app/api/waitlist/route";
import { Reservation } from "@prisma/client";

vi.mock('@/infrastructure/prisma', () => ({
    default: {
        reservation: { findFirst: vi.fn(), create: vi.fn() },
        systemLog: { create: vi.fn() }
    }
}));

vi.mock('@/infrastructure/stripe', () => ({
    stripe: {
        checkout: { sessions: { create: vi.fn() } }
    }
}));

describe('Endpoint POST /api/reservations', () => {

    beforeEach(() => { vi.clearAllMocks(); });

    it('Should prevent a reservation and return 409 Conflict if the selected time slot is already booked (Overbooking Protection)', async () => {

        vi.mocked(prisma.reservation.findFirst).mockResolvedValue({ id: 'istniejaca_rezerwacja' } as unknown as Reservation);

        const req = new Request('http://localhost/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                patientName: 'Jan Kowalski', email: 'jan@test.pl', phone: '123456789',
                serviceId: 'srv_1', date: new Date().toISOString(), termsAccepted: true
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(409);
        expect(data.error).toContain('ten termin został właśnie zarezerwowany');
    });

    it('Should generate a Stripe session using the secure price retrieved from the database', async () => {

        vi.mocked(prisma.reservation.findFirst).mockResolvedValue(null);

        vi.mocked(prisma.reservation.create).mockResolvedValue({
            id: 'nowa_rezerwacja', email: 'jan@test.pl',
            service: { name: 'Konsultacja', price: 250 }
        } as unknown as Reservation);

        vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({ url: 'https://stripe.com/pay' } as never);

        const req = new Request('http://localhost/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                patientName: 'Jan Kowalski', email: 'jan@test.pl', phone: '123456789',
                serviceId: 'srv_1', date: new Date().toISOString(), termsAccepted: true
            })
        });

        const res = await POST(req);

        expect(res.status).toBe(201);

        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                line_items: expect.arrayContaining([
                    expect.objectContaining({
                        price_data: expect.objectContaining({ unit_amount: 25000 })
                    })
                ])
            })
        );
    });
});
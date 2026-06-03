import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import prisma from '@/infrastructure/prisma';
import {GET} from "@/app/api/slots/route";

vi.mock('@/infrastructure/prisma', () => ({
    default: {
        reservation: { findMany: vi.fn() },
        blockedTime: { findMany: vi.fn() },
        weeklySchedule: { findMany: vi.fn() }
    }
}));

describe('Calendar Engine (GET /api/slots)', () => {
    const MOCK_TODAY = new Date(2026, 5, 1, 10, 0, 0);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(MOCK_TODAY);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('Should return a 400 Bad Request error if the start date is not provided.', async () => {
        const req = new Request('http://localhost/api/slots');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBe('Brak daty startowej');
    });

    it('Should generate valid slots based on the default schedule when the database is empty.', async () => {

        vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
        vi.mocked(prisma.blockedTime.findMany).mockResolvedValue([]);
        vi.mocked(prisma.weeklySchedule.findMany).mockResolvedValue([]);

        const req = new Request('http://localhost/api/slots?startDate=2026-06-01');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.days).toHaveLength(30);

        const firstDay = data.days[0];
        expect(firstDay.slots).toHaveLength(3);

        const slot17 = firstDay.slots.find((s: any) => s.time === '17:00');
        expect(slot17.available).toBe(true);
    });

    it('Overbooking protection: should block a slot if an already paid reservation exists.', async () => {
        const bookedDate = new Date(2026, 5, 1, 18, 0, 0);
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([
            { date: bookedDate, status: 'PAID' } as any
        ]);
        vi.mocked(prisma.blockedTime.findMany).mockResolvedValue([]);
        vi.mocked(prisma.weeklySchedule.findMany).mockResolvedValue([]);

        const req = new Request('http://localhost/api/slots?startDate=2026-06-01');
        const res = await GET(req);
        const data = await res.json();

        const firstDay = data.days[0];
        const slot17 = firstDay.slots.find((s: any) => s.time === '17:00');
        const slot18 = firstDay.slots.find((s: any) => s.time === '18:00');

        expect(slot17.available).toBe(true);
        expect(slot18.available).toBe(false);
    });

    it('Overbooking protection: should block slots that overlap with vacation blocks (BlockedTime).', async () => {
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
        vi.mocked(prisma.weeklySchedule.findMany).mockResolvedValue([]);

        const blockStart = new Date(2026, 5, 1, 16, 30, 0);
        const blockEnd = new Date(2026, 5, 1, 18, 30, 0);
        vi.mocked(prisma.blockedTime.findMany).mockResolvedValue([
            { startDate: blockStart, endDate: blockEnd } as any
        ]);

        const req = new Request('http://localhost/api/slots?startDate=2026-06-01');
        const res = await GET(req);
        const data = await res.json();

        const firstDay = data.days[0];


        expect(firstDay.slots.find((s: any) => s.time === '17:00').available).toBe(false);
        expect(firstDay.slots.find((s: any) => s.time === '18:00').available).toBe(false);
        expect(firstDay.slots.find((s: any) => s.time === '19:00').available).toBe(true);
    });
});
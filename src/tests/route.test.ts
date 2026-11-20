import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import prisma from '@/infrastructure/prisma';
import { GET } from "@/app/api/slots/route";
import { ITestSlot } from "@/types/test";

vi.mock('@/infrastructure/prisma', () => ({
    default: {
        reservation: { findMany: vi.fn() },
        blockedTime: { findMany: vi.fn() },
        weeklySchedule: { findMany: vi.fn() }
    }
}));

const get = async (startDate?: string) => {
    const url = startDate ? `http://localhost/api/slots?startDate=${startDate}` : 'http://localhost/api/slots';
    const res = await GET(new Request(url));
    return { res, data: await res.json() };
};

/**
 * Schedule is in London time, labels are Polish time. Default schedule: Monday 17:00–20:00 London.
 *  - summer (BST/CEST): 17:00 London = 16:00 UTC = 18:00 Warsaw
 *  - winter (GMT/CET):  17:00 London = 17:00 UTC = 18:00 Warsaw
 */
describe('Calendar Engine (GET /api/slots)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-01T08:00:00Z')); // Monday morning
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
        vi.mocked(prisma.blockedTime.findMany).mockResolvedValue([]);
        vi.mocked(prisma.weeklySchedule.findMany).mockResolvedValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns 400 when the start date is missing or malformed', async () => {
        expect((await get()).res.status).toBe(400);
        expect((await get()).data.error).toBe('Brak daty startowej');
        expect((await get('abc')).res.status).toBe(400);
        expect((await get('2026-13-45')).res.status).toBe(400);
    });

    it('generates London-schedule slots labelled in Polish time (summer)', async () => {
        const { res, data } = await get('2026-06-01');

        expect(res.status).toBe(200);
        expect(data.days).toHaveLength(30);

        const monday = data.days[0];
        expect(monday.dateKey).toBe('2026-06-01');
        expect(monday.isToday).toBe(true);
        expect(monday.slots.map((s: ITestSlot) => s.time)).toEqual(['18:00', '19:00', '20:00']);
        expect(monday.slots[0].startsAt).toBe('2026-06-01T16:00:00.000Z');
        expect(monday.slots.every((s: ITestSlot) => s.available)).toBe(true);
    });

    it('keeps the same Polish labels in winter (both zones shift together)', async () => {
        vi.setSystemTime(new Date('2026-12-07T08:00:00Z')); // Monday
        const { data } = await get('2026-12-07');

        const monday = data.days[0];
        expect(monday.slots.map((s: ITestSlot) => s.time)).toEqual(['18:00', '19:00', '20:00']);
        expect(monday.slots[0].startsAt).toBe('2026-12-07T17:00:00.000Z');
    });

    it('blocks a slot that overlaps an existing visit (duration-aware)', async () => {
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([
            { date: new Date('2026-06-01T17:00:00Z'), service: { duration: 50 } },
        ] as never);

        const { data } = await get('2026-06-01');
        const slots = data.days[0].slots;

        expect(slots.find((s: ITestSlot) => s.time === '18:00')?.available).toBe(true);
        expect(slots.find((s: ITestSlot) => s.time === '19:00')?.available).toBe(false);
        expect(slots.find((s: ITestSlot) => s.time === '20:00')?.available).toBe(true);
    });

    it('blocks both slots touched by a visit at an odd time (e.g. moved to half past)', async () => {
        vi.mocked(prisma.reservation.findMany).mockResolvedValue([
            { date: new Date('2026-06-01T16:30:00Z'), service: { duration: 50 } },
        ] as never);

        const { data } = await get('2026-06-01');
        const slots = data.days[0].slots;

        expect(slots.find((s: ITestSlot) => s.time === '18:00')?.available).toBe(false);
        expect(slots.find((s: ITestSlot) => s.time === '19:00')?.available).toBe(false);
        expect(slots.find((s: ITestSlot) => s.time === '20:00')?.available).toBe(true);
    });

    it('blocks slots overlapping blocked time', async () => {
        vi.mocked(prisma.blockedTime.findMany).mockResolvedValue([
            { startDate: new Date('2026-06-01T15:30:00Z'), endDate: new Date('2026-06-01T17:30:00Z') },
        ] as never);

        const { data } = await get('2026-06-01');
        const slots = data.days[0].slots;

        expect(slots.find((s: ITestSlot) => s.time === '18:00')?.available).toBe(false);
        expect(slots.find((s: ITestSlot) => s.time === '19:00')?.available).toBe(false);
        expect(slots.find((s: ITestSlot) => s.time === '20:00')?.available).toBe(true);
    });

    it('marks slots that already started as unavailable', async () => {
        vi.setSystemTime(new Date('2026-06-01T16:30:00Z')); // during the first slot
        const { data } = await get('2026-06-01');
        const slots = data.days[0].slots;

        expect(slots.find((s: ITestSlot) => s.time === '18:00')?.available).toBe(false);
        expect(slots.find((s: ITestSlot) => s.time === '19:00')?.available).toBe(true);
    });

    it('treats malformed schedule rows as days off instead of opening every hour', async () => {
        vi.mocked(prisma.weeklySchedule.findMany).mockResolvedValue([
            { id: 'a', dayOfWeek: 1, startTime: 'abc', endTime: '20:00', isActive: true },
            { id: 'b', dayOfWeek: 2, startTime: '', endTime: '', isActive: true },
        ] as never);

        const { data } = await get('2026-06-01');
        expect(data.days[0].slots).toHaveLength(0); // Monday
        expect(data.days[1].slots).toHaveLength(0); // Tuesday
    });
});

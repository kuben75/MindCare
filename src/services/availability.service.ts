import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/prisma";
import { getWarsawNow } from "@/utils/warsaw-time";
import { DateTime } from "luxon";

type DbClient = Prisma.TransactionClient | typeof prisma;

const FALLBACK_SCHEDULES = [
    { dayOfWeek: 1, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 2, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 3, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 4, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isActive: true },
    { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isActive: true },
    { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isActive: false },
];

/** Unpaid reservations stop holding a slot after this long (matches the cleanup cron). */
export const PENDING_HOLD_MS = 24 * 60 * 60 * 1000;

/**
 * Reservations that still occupy their slot: everything except CANCELLED, and except PENDING
 * ones older than PENDING_HOLD_MS (so abandoned/spam bookings stop blocking the calendar even
 * before the daily cleanup cron runs).
 */
export function slotBlockingReservationWhere(now: Date = new Date()): Prisma.ReservationWhereInput {
    return {
        status: { not: "CANCELLED" },
        NOT: { status: "PENDING", createdAt: { lt: new Date(now.getTime() - PENDING_HOLD_MS) } },
    };
}

export async function isSlotAvailable(
    date: Date | string,
    durationMinutes: number,
    db: DbClient = prisma
): Promise<boolean> {
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return false;
    }

    const warsawNow = getWarsawNow();
    const slotStart = DateTime.fromJSDate(parsedDate).setZone("Europe/Warsaw");

    if (!slotStart.isValid) {
        return false;
    }

    const maxHorizon = warsawNow.plus({ days: 30 }).endOf("day");
    if (slotStart < warsawNow || slotStart > maxHorizon) {
        return false;
    }

    if (slotStart.minute !== 0 || slotStart.second !== 0) {
        return false;
    }

    const slotEnd = slotStart.plus({ minutes: durationMinutes });

    const dayOfWeek = slotStart.weekday === 7 ? 0 : slotStart.weekday;
    const dbSchedules = await db.weeklySchedule.findMany();
    const schedules = dbSchedules.length > 0 ? dbSchedules : FALLBACK_SCHEDULES;
    const dayConfig = schedules.find((s) => s.dayOfWeek === dayOfWeek);

    if (!dayConfig || !dayConfig.isActive) {
        return false;
    }

    const [startHour, startMinute = 0] = dayConfig.startTime.split(":").map(Number);
    const [endHour, endMinute = 0] = dayConfig.endTime.split(":").map(Number);

    const dayWorkStart = slotStart.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
    const dayWorkEnd = slotStart.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

    if (slotStart < dayWorkStart || slotEnd > dayWorkEnd) {
        return false;
    }

    const jsSlotStart = slotStart.toJSDate();
    const jsSlotEnd = slotEnd.toJSDate();

    const overlappingBlock = await db.blockedTime.findFirst({
        where: {
            startDate: { lt: jsSlotEnd },
            endDate: { gt: jsSlotStart },
        },
        select: { id: true },
    });

    if (overlappingBlock) {
        return false;
    }

    const dayStart = slotStart.startOf("day").toJSDate();
    const dayEnd = slotStart.endOf("day").toJSDate();

    const existingReservations = await db.reservation.findMany({
        where: {
            date: { gte: dayStart, lte: dayEnd },
            ...slotBlockingReservationWhere(),
        },
        include: {
            service: { select: { duration: true } },
        },
    });

    const hasCollision = existingReservations.some((res) => {
        const resStart = res.date.getTime();
        const resDuration = res.service?.duration ?? 60;
        const resEnd = resStart + resDuration * 60 * 1000;
        return resStart < jsSlotEnd.getTime() && resEnd > jsSlotStart.getTime();
    });

    return !hasCollision;
}
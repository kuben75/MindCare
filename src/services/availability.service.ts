import prisma from "@/infrastructure/prisma";
import { DateTime } from "luxon";

export async function isSlotAvailable(
    dateParam: string | Date,
    serviceDurationMinutes: number = 60,
    ignoreReservationId?: string
): Promise<boolean> {
    const requestedDt = DateTime.fromJSDate(new Date(dateParam)).setZone("Europe/Warsaw");
    const requestedStart = requestedDt.toJSDate();
    const requestedEnd = requestedDt.plus({ minutes: serviceDurationMinutes }).toJSDate();

    const dayStart = requestedDt.startOf("day").toJSDate();
    const dayEnd = requestedDt.endOf("day").toJSDate();

    const existingReservations = await prisma.reservation.findMany({
        where: {
            date: {
                gte: dayStart,
                lte: dayEnd,
            },
            status: {
                not: "CANCELLED",
            },
            ...(ignoreReservationId ? { id: { not: ignoreReservationId } } : {}),
        },
        include: {
            service: true,
        },
    });

    for (const res of existingReservations) {
        const existingStart = new Date(res.date);
        const duration = res.service?.duration || 60;
        const existingEnd = new Date(existingStart.getTime() + duration * 60 * 1000);

        if (requestedStart < existingEnd && requestedEnd > existingStart) {
            return false;
        }
    }

    return true;
}
import {DateTime} from "luxon";
import {getWarsawNow} from "@/utils/warsaw-time";
import prisma from "@/infrastructure/prisma";
import {Reservation} from "@prisma/client";

export async function isSlotAvailable(dateParam: Date, serviceDurationInMinutes: number, ignoreReservationId?: string) {
    const luxonStart = DateTime.fromJSDate(dateParam).setZone("Europe/Warsaw");
    const luxonEnd = luxonStart.plus({minutes: serviceDurationInMinutes})

    if( luxonStart < getWarsawNow()) {
        return {available: false, reason: "Nie można rezerwować w przeszłości"};
    }

    const jsStart = luxonStart.toJSDate();
    const jsEnd = luxonEnd.toJSDate();

    const conflictingBlock = await prisma.blockedTime.findFirst({
        where: {
            startDate: {lt: jsEnd},
            endDate: {gt: jsStart}
        }
    });

    if(conflictingBlock) {
        return {available: false, reason: "Ten termin jest zablokowany"};
    }

    const startOfDay = luxonStart.startOf("day").toJSDate();
    const endOfDay = luxonEnd.endOf("day").toJSDate();

    const daysReservation = await prisma.reservation.findMany({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                not: "CANCELLED"
            },
            ...(ignoreReservationId ? {id: {not: ignoreReservationId}} : {})
        },
        include: {
            service: true
        }
    });

    const conflictingReservation = daysReservation.find((res: Reservation) => {
        const resLuxonStart = DateTime.fromJSDate(res.date).setZone("Europe/Warsaw");
        const resLuxonEnd = resLuxonStart.plus({minutes: res.service.duration});
        return resLuxonStart < luxonEnd && resLuxonEnd > luxonStart;
    });

    if (conflictingReservation) {
        return {available: false, reason: "Ten termin jest już zajęty"};
    }
    return {available: true, reason: null};
}
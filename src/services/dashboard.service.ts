import prisma from "@/infrastructure/prisma";
import {BUSINESS_TZ, nowIn} from "@/lib/time";


export async function getDashboardDate() {
    // "Today" / "tomorrow" in the clinic time zone.
    const luxonStartToday = nowIn(BUSINESS_TZ).startOf('day');

    const startToday = luxonStartToday.toJSDate();
    const todayEnd = luxonStartToday.endOf('day').toJSDate();

    const tomorrowStart = luxonStartToday.plus({ days: 1 }).toJSDate();
    const tomorrowEnd = luxonStartToday.plus({ days: 1 }).endOf('day').toJSDate();

    const [
        todaysAppointments,
        pendingVisitsCount,
        activeServicesCount,
        rescheduleRequestsCount,
        tomorrowVisitsCount
    ] = await Promise.all([
        prisma.reservation.findMany({
            where: { date: { gte: startToday, lte: todayEnd }, status: { not: 'CANCELLED' } },
            include: { service: true },
            orderBy: { date: 'asc' }
        }),
        prisma.reservation.count({ where: { status: 'PENDING' } }),
        prisma.service.count({ where: { isActive: true } }),
        prisma.reservation.count({ where: { rescheduleRequested: true, status: { not: 'CANCELLED' } } }),
        prisma.reservation.count({
            where: { date: { gte: tomorrowStart, lte: tomorrowEnd }, status: { not: 'CANCELLED' } }
        })
    ]);

    return {
        todaysAppointments,
        todayVisitsCount: todaysAppointments.length,
        tomorrowVisitsCount,
        pendingVisitsCount,
        activeServicesCount,
        rescheduleRequestsCount
    };
}
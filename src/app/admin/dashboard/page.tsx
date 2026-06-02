import prisma from "@/infrastructure/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date(startToday);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const [
        todaysAppointments,
        pendingVisitsCount,
        activeServicesCount,
        rescheduleRequestsCount,
        tomorrowVisitsCount
    ] = await Promise.all([
        prisma.reservation.findMany({
            where: {
                date: { gte: startToday, lte: todayEnd },
                status: { not: 'CANCELLED' }
            },
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

    const payload = {
        todaysAppointments,
        todayVisitsCount: todaysAppointments.length,
        tomorrowVisitsCount,
        pendingVisitsCount,
        activeServicesCount,
        rescheduleRequestsCount
    };

    return <DashboardClient data={payload} />;
}
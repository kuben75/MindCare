import prisma from "@/infrastructure/prisma";
import {ITransaction} from "@/types/transaction";
import { getWarsawNow } from "@/utils/warsaw-time";
import { DateTime } from "luxon";

export async function getFinancesData() {

    const warsawNow = getWarsawNow();

   const firstDayOfCurrentMonth = warsawNow.startOf('month');
    const firstDayOfPrevMonth = firstDayOfCurrentMonth.minus({ months: 1 });
    const sixMonthsAgo = firstDayOfCurrentMonth.minus({ months: 5 });

    const [
        statusGroup,
        allPaidRevenues,
        recentPaidReservations
    ] = await Promise.all([

        prisma.reservation.groupBy({
            by: ['status'],
            _count: true,
        }),

        prisma.reservation.findMany({
            where: { status: { in: ['PAID', 'COMPLETED'] } },
            select: { service: { select: { price: true } } }
        }),

        prisma.reservation.findMany({
            where: {
                date: { gte: sixMonthsAgo.toJSDate() },
                status: { in: ['PAID', 'COMPLETED'] }
            },
            include: { service: true },
            orderBy: { date: 'asc' }
        })
    ]);

    type StatusGroupEntry = (typeof statusGroup)[number];
    type PaidRevenue = (typeof allPaidRevenues)[number];

    const getCount = (status: string) => statusGroup.find((s: StatusGroupEntry) => s.status === status)?._count || 0;
    const completedCount = getCount('COMPLETED');
    const cancelledCount = getCount('CANCELLED');
    const pendingCount = getCount('PENDING');
    const paidCount = getCount('PAID');

    const totalRevenue = allPaidRevenues.reduce((sum: number, res: PaidRevenue) => sum + res.service.price, 0);

    let currentMonthRevenue = 0;
    let prevMonthRevenue = 0;
    const serviceStats: Record<string, { count: number; revenue: number }> = {};
    const monthlyRevenue: Record<string, number> = {};
    const currentMonthTransactions: ITransaction[] = [];

    for (let i = 5; i >= 0; i--) {
        const targetMonth = firstDayOfCurrentMonth.minus({ months: i });
        const key = targetMonth.toFormat("MMM yyyy", { locale: 'pl-PL' });
        monthlyRevenue[key] = 0;
    }

    for (const res of recentPaidReservations) {
        const price = res.service.price;
        const resDate = DateTime.fromJSDate(new Date(res.date)).setZone("Europe/Warsaw");
        const key = resDate.toFormat("MMM yyyy", { locale: 'pl-PL' });

        if (key in monthlyRevenue) monthlyRevenue[key] += price;

        if (!serviceStats[res.service.name]) {
            serviceStats[res.service.name] = { count: 0, revenue: 0 };
        }
        serviceStats[res.service.name].count += 1;
        serviceStats[res.service.name].revenue += price;

        if (resDate >= firstDayOfCurrentMonth) {
            currentMonthRevenue += price;
            currentMonthTransactions.push({
                id: res.id,
                date: res.date.toISOString(),
                patientName: res.patientName,
                serviceName: res.service.name,
                price,
                status: res.status === 'COMPLETED' ? 'Zakończona' : 'Opłacona',
            });
        }
        else if (resDate >= firstDayOfPrevMonth && resDate < firstDayOfCurrentMonth) {
            prevMonthRevenue += price;
        }
    }

    const topServices = Object.entries(serviceStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue);

    const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));

    const momDelta = prevMonthRevenue > 0
        ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : null;

    const avgPerVisit = (completedCount + paidCount) > 0
        ? Math.round(totalRevenue / (completedCount + paidCount))
        : 0;

    return {
        totalRevenue,
        currentMonthRevenue,
        prevMonthRevenue,
        momDelta,
        completedCount,
        cancelledCount,
        pendingCount,
        paidCount,
        avgPerVisit,
        topServices,
        chartData,
        currentMonthTransactions
    }
}
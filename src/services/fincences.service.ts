import prisma from "@/infrastructure/prisma";
import {ITransaction} from "@/types/transaction";


export async function getFinancesData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);

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
                date: { gte: sixMonthsAgo },
                status: { in: ['PAID', 'COMPLETED'] }
            },
            include: { service: true },
            orderBy: { date: 'asc' }
        })
    ]);

    const getCount = (status: string) => statusGroup.find(s => s.status === status)?._count || 0;
    const completedCount = getCount('COMPLETED');
    const cancelledCount = getCount('CANCELLED');
    const pendingCount = getCount('PENDING');
    const paidCount = getCount('PAID');

    const totalRevenue = allPaidRevenues.reduce((sum, res) => sum + res.service.price, 0);

    let currentMonthRevenue = 0;
    let prevMonthRevenue = 0;
    const serviceStats: Record<string, { count: number; revenue: number }> = {};
    const monthlyRevenue: Record<string, number> = {};
    const currentMonthTransactions: ITransaction[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const key = d.toLocaleString('pl-PL', { month: 'short', year: 'numeric' });
        monthlyRevenue[key] = 0;
    }

    for (const res of recentPaidReservations) {
        const price = res.service.price;
        const resDate = new Date(res.date);
        const key = resDate.toLocaleString('pl-PL', { month: 'short', year: 'numeric' });

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
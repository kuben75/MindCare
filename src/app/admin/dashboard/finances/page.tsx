import FinancesClient from "./FinancesClient";
import {getFinancesData} from "@/services/fincences.service";

export const dynamic = 'force-dynamic';

export default async function FinancesPage() {

    const {
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
    } = await getFinancesData();
    return (
        <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-16 max-w-7xl mx-auto">
            <FinancesClient
                totalRevenue={totalRevenue}
                currentMonthRevenue={currentMonthRevenue}
                prevMonthRevenue={prevMonthRevenue}
                momDelta={momDelta}
                completedCount={completedCount}
                cancelledCount={cancelledCount}
                pendingCount={pendingCount}
                paidCount={paidCount}
                avgPerVisit={avgPerVisit}
                topServices={topServices}
                chartData={chartData}
                currentMonthTransactions={currentMonthTransactions.reverse()}
            />
        </div>
    );
}
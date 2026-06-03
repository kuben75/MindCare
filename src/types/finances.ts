import React from "react";

export interface ITransaction {
    id: string;
    date: string;
    patientName: string;
    serviceName: string;
    price: number;
    status: string;
}

export interface IServiceStat {
    name: string;
    count: number;
    revenue: number;
}

export interface IChartPoint {
    month: string;
    revenue: number;
}

export interface IFinancesProps {
    totalRevenue: number;
    currentMonthRevenue: number;
    prevMonthRevenue: number;
    momDelta: number | null;
    completedCount: number;
    cancelledCount: number;
    pendingCount: number;
    paidCount: number;
    avgPerVisit: number;
    topServices: IServiceStat[];
    chartData: IChartPoint[];
    currentMonthTransactions: ITransaction[];
}

export type TFinancesCardProps = Pick<
    IFinancesProps,
    'chartData' | 'currentMonthTransactions'
>;

export interface KpiCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
}
export type TStatusColor = "emerald" | "blue" | "red";

export interface StatusBarProps {
    label: string;
    count: number;
    total: number;
    color: TStatusColor;
}
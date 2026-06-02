import React from "react";

export interface Transaction {
    id: string;
    date: string;
    patientName: string;
    serviceName: string;
    price: number;
    status: string;
}

export interface ServiceStat {
    name: string;
    count: number;
    revenue: number;
}

export interface ChartPoint {
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
    topServices: ServiceStat[];
    chartData: ChartPoint[];
    currentMonthTransactions: Transaction[];
}

export type IFinancesCardProps = Pick<
    IFinancesProps,
    'chartData' | 'currentMonthTransactions'
>;

export interface KpiCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
}
export type StatusColor = "emerald" | "blue" | "red";

export interface StatusBarProps {
    label: string;
    count: number;
    total: number;
    color: StatusColor;
}
import {TReservationWithService} from "@/types/reservation";
import React from "react";
import {THeroTemplate} from "@/types/hero";
import {ToastType} from "@/types/toast";

export interface IDashboardData {
    todaysAppointments: TReservationWithService[];
    todayVisitsCount: number;
    tomorrowVisitsCount: number;
    pendingVisitsCount: number;
    activeServicesCount: number;
    rescheduleRequestsCount: number;
}

export interface IWeekViewDesktopProps {
    currentDate: Date;
    getDaysOfWeek: (date: Date) => Date[];
    visibleReservations: TReservationWithService[];
    setSelectedRes: React.Dispatch<React.SetStateAction<TReservationWithService | null>>;
}

export interface IHeroTemplate {
    templates: THeroTemplate[];
    isLoading: boolean;
    actionLoading: string | null;
    handleActivate: (id: string) => Promise<void>;
    handleDelete: (id: string, isActive: boolean) => Promise<void>;
    toast: { message: string; type: ToastType } | null;
    hideToast: () => void;
}
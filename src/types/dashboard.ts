import {TReservationWithService} from "@/types/reservation";
import React from "react";

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
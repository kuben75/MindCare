export interface IDashboardData {
    todaysAppointments: any[];
    todayVisitsCount: number;
    tomorrowVisitsCount: number;
    pendingVisitsCount: number;
    activeServicesCount: number;
    rescheduleRequestsCount: number;
}

export interface IWeekViewDesktopProps {
    currentDate: Date;
    getDaysOfWeek: (date: Date) => Date[];
    visibleReservations: any[];
    setSelectedRes: (res: any) => void;
}
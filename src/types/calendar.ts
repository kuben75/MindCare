import React from "react";
import {TReservationWithService} from "@/types/reservation";

export type TVisitType = "online" | "gabinet";

export interface ITimeSlot {
    id: string;
    time: string;
    available: boolean;
    type: TVisitType;
}

export interface IDaySchedule {
    date: Date;
    slots: ITimeSlot[];
    isToday: boolean;
}

export interface IBookingBarProps {
    selectedSlot: { date: Date; time: string } | null;
}

export interface IDaysCarouselProps {
    calendarData: IDaySchedule[];
    selectedSlot: { date: Date; time: string } | null;
    setSelectedSlot: (slot: { date: Date; time: string } | null) => void;
    today: Date;
    carouselRef: React.RefObject<HTMLDivElement | null>;
    onScroll: () => void;
}

export interface ICalendarHeaderProps {
    startDate: Date;
    today: Date;
    maxDate: Date;
    handleMove: (direction: 1 | -1) => void;
    jumpToDate: (date: string) => void;
}

export type TViewType = 'day' | 'week' | 'month';

export interface IMonthViewProps {
    getDaysInMonth: (date: Date) => any[];
    currentDate: Date;
    visibleReservations: any[];
    setSelectedRes: (res: any) => void;
    setCurrentDate: (date: Date) => void;
    setView: (view: 'day' | 'week' | 'month') => void;
}

export interface IDayViewProps {
    visibleReservations: TReservationWithService[];
    setSelectedRes: React.Dispatch<React.SetStateAction<TReservationWithService | null>>;
}

export interface IEventCardProps {
    match: TReservationWithService;
    onClick: () => void;
}

export interface ICalendarHeaderProps {
    handleToday: () => void;
    handleNavigate: (direction: 'prev' | 'next') => void;
    formatHeaderDate: () => string;
    view: TViewType;
    setView: (view: TViewType) => void;
}
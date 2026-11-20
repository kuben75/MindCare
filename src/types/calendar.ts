import React from "react";
import {TReservationWithService} from "@/types/reservation";

export type TVisitType = "online" | "gabinet";

export interface ITimeSlot {
    id: string;
    /** Wall-clock time in Polish time (PATIENT_TZ), e.g. "18:00". */
    time: string;
    /** Real instant (ISO, UTC). */
    startsAt: string;
    available: boolean;
    type: TVisitType;
}

export interface IDaySchedule {
    /** Floating date of the Polish calendar day (see lib/time). */
    date: Date;
    /** Polish calendar day, "yyyy-MM-dd". */
    dateKey: string;
    slots: ITimeSlot[];
    isToday: boolean;
}

export type TSelectedSlot = { date: Date; dateKey: string; time: string; startsAt: string };

export interface IBookingBarProps {
    selectedSlot: TSelectedSlot | null;
}

export interface IDaysCarouselProps {
    calendarData: IDaySchedule[];
    selectedSlot: TSelectedSlot | null;
    setSelectedSlot: (slot: TSelectedSlot | null) => void;
    today: Date;
    carouselRef: React.RefObject<HTMLDivElement | null>;
    onScroll: () => void;
}

export interface IPublicCalendarHeaderProps {
    startDate: Date;
    today: Date;
    maxDate: Date;
    handleMove: (direction: 1 | -1) => void;
    jumpToDate: (date: string) => void;
}

export type TViewType = 'day' | 'week' | 'month';

export interface IMonthDay {
    date: Date;
    isCurrentMonth: boolean;
}

export interface IMonthViewProps {
    getDaysInMonth: (date: Date) => IMonthDay[];
    currentDate: Date;
    visibleReservations: TCalendarReservation[];
    setSelectedRes: React.Dispatch<React.SetStateAction<TReservationWithService | null>>;
    setCurrentDate: (date: Date) => void;
    setView: (view: TViewType) => void;
}

export interface IDayViewProps {
    visibleReservations: TCalendarReservation[];
    setSelectedRes: React.Dispatch<React.SetStateAction<TReservationWithService | null>>;
}

export interface IEventCardProps {
    match: TCalendarReservation;
    onClick: () => void;
}

export interface IAdminCalendarHeaderProps {
    handleToday: () => void;
    handleNavigate: (direction: 'prev' | 'next') => void;
    formatHeaderDate: () => string;
    view: TViewType;
    setView: (view: TViewType) => void;
}

export type TPublicCalendarParams = Pick<IPublicCalendarHeaderProps, 'startDate' | 'today' | 'maxDate' | 'jumpToDate'>

export type TRawDaySchedule = Omit<IDaySchedule, 'date'> & { date: string };

export type TCalendarReservation = TReservationWithService & {
    /** Floating date in the clinic time zone (BUSINESS_TZ) — for display/grouping only. */
    displayDate: Date;
};

export interface IWeekViewMobileProps {
    currentDate: Date;
    getDaysOfWeek: (date: Date) => Date[];
    visibleReservations: TCalendarReservation[];
    setSelectedRes: React.Dispatch<React.SetStateAction<TReservationWithService | null>>;
}
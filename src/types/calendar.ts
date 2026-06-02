import React from "react";

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


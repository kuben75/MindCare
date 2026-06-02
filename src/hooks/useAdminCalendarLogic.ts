import { POLISH_MONTHS } from "@/constants/calendar";
import { useState } from "react";
import { TViewType } from "@/types/calendar";
import {TReservationWithService} from "@/types/reservation";

export const useAdminCalendarLogic = (initialReservations: TReservationWithService[]) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [view, setView] = useState<TViewType>('week');

    const handleNavigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (view === 'day') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        } else if (view === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const handleToday = () => setCurrentDate(new Date());

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getDaysOfWeek = (date: Date) => {
        const start = getStartOfWeek(date);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        let startDay = startOfMonth.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const days = [];
        for (let i = startDay; i > 0; i--) {
            const d = new Date(year, month, 1 - i);
            days.push({ date: d, isCurrentMonth: false });
        }
        for (let i = 1; i <= endOfMonth.getDate(); i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, isCurrentMonth: true });
        }
        return days;
    };

    const visibleReservations = initialReservations.filter(res => {
        const resDate = new Date(res.date);
        if (view === 'day') {
            return resDate.toDateString() === currentDate.toDateString();
        } else if (view === 'week') {
            const weekDays = getDaysOfWeek(currentDate);
            return resDate >= weekDays[0] && resDate <= new Date(new Date(weekDays[6]).setHours(23, 59, 59));
        } else {
            return resDate.getMonth() === currentDate.getMonth() && resDate.getFullYear() === currentDate.getFullYear();
        }
    });

    const stats = visibleReservations.reduce((acc, res) => {
        if (res.status === 'CANCELLED') {
            return acc;
        }
        acc.totalCount += 1;
        acc.totalMinutes += res.service.duration;
        acc.estimatedEarnings += res.service.price;
        if (res.status === 'PAID') {
            acc.paidCount += 1;
        }
        if (res.status === 'PENDING') {
            acc.pendingCount += 1;
        }
        return acc;
    }, { totalCount: 0, totalMinutes: 0, estimatedEarnings: 0, paidCount: 0, pendingCount: 0 });

    const formatHeaderDate = () => {
        if (view === 'day') {
            return currentDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } else if (view === 'week') {
            const days = getDaysOfWeek(currentDate);
            return `${days[0].getDate()} - ${days[6].getDate()} ${POLISH_MONTHS[days[6].getMonth()]} ${days[6].getFullYear()}`;
        } else {
            return `${POLISH_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    };

    return {
        currentDate,
        setCurrentDate,
        view,
        handleNavigate,
        handleToday,
        visibleReservations,
        stats,
        formatHeaderDate,
        setView,
        getDaysOfWeek,
        getDaysInMonth,
    }
};
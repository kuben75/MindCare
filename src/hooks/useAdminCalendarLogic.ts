import { POLISH_MONTHS } from "@/constants/calendar";
import { useState } from "react";
import { TViewType } from "@/types/calendar";
import { TReservationWithService } from "@/types/reservation";
import { DateTime } from "luxon";
import { getWarsawStartOfDay, getWarsawNow } from "@/utils/warsaw-time";

export const useAdminCalendarLogic = (initialReservations: TReservationWithService[]) => {
    const [currentDateString, setCurrentDateString] = useState<string>(getWarsawStartOfDay().toISODate()!);
    const [view, setView] = useState<TViewType>('week');

    const luxonCurrent = DateTime.fromISO(currentDateString).setZone('Europe/Warsaw');
    const currentDate = luxonCurrent.toJSDate();

    const handleNavigate = (direction: 'prev' | 'next') => {
        let newLuxon = luxonCurrent;
        if (view === 'day') {
            newLuxon = luxonCurrent.plus({ days: direction === 'next' ? 1 : -1 });
        } else if (view === 'week') {
            newLuxon = luxonCurrent.plus({ weeks: direction === 'next' ? 1 : -1 });
        } else {
            newLuxon = luxonCurrent.plus({ months: direction === 'next' ? 1 : -1 });
        }
        setCurrentDateString(newLuxon.toISODate()!);
    };

    const handleToday = () => setCurrentDateString(getWarsawStartOfDay().toISODate()!);

    const getStartOfWeek = (date: Date) => {
        return DateTime.fromJSDate(date).setZone('Europe/Warsaw').startOf('week').toJSDate();
    };

    const getDaysOfWeek = (date: Date) => {
        const luxonStart = DateTime.fromJSDate(date).setZone('Europe/Warsaw').startOf('week');
        return Array.from({ length: 7 }, (_, i) => luxonStart.plus({ days: i }).toJSDate());
    };

    const getDaysInMonth = (date: Date) => {
        const luxonDate = DateTime.fromJSDate(date).setZone('Europe/Warsaw');
        const startOfMonth = luxonDate.startOf('month');
        const endOfMonth = luxonDate.endOf('month');

        let startDay = startOfMonth.weekday - 1;

        const days = [];
        for (let i = startDay; i > 0; i--) {
            days.push({
                date: startOfMonth.minus({ days: i }).toJSDate(),
                isCurrentMonth: false
            });
        }
        for (let i = 0; i < endOfMonth.day; i++) {
            days.push({
                date: startOfMonth.plus({ days: i }).toJSDate(),
                isCurrentMonth: true
            });
        }
        return days;
    };

    const visibleReservations = initialReservations.filter(res => {

        if (res.status === 'CANCELLED') return false;

        const resDate = DateTime.fromJSDate(new Date(res.date)).setZone('Europe/Warsaw');

        if (view === 'day') {
            return resDate.hasSame(luxonCurrent, 'day');
        } else if (view === 'week') {
            const startOfWeek = luxonCurrent.startOf('week');
            const endOfWeek = luxonCurrent.endOf('week');
            return resDate >= startOfWeek && resDate <= endOfWeek;
        } else {
            return resDate.hasSame(luxonCurrent, 'month');
        }
    });

    const stats = visibleReservations.reduce((acc, res) => {
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
            return luxonCurrent.toFormat("EEEE, d MMMM yyyy", { locale: 'pl-PL' });
        } else if (view === 'week') {
            const start = luxonCurrent.startOf('week');
            const end = luxonCurrent.endOf('week');

            const startMonth = POLISH_MONTHS[start.month - 1];
            const endMonth = POLISH_MONTHS[end.month - 1];

            if (start.month === end.month) {
                return `${start.day} - ${end.day} ${startMonth} ${end.year}`;
            }
            return `${start.day} ${startMonth} - ${end.day} ${endMonth} ${end.year}`;
        } else {
            return `${POLISH_MONTHS[luxonCurrent.month - 1]} ${luxonCurrent.year}`;
        }
    };

    return {
        currentDate,
        setCurrentDate: (date: Date) => setCurrentDateString(DateTime.fromJSDate(date).setZone('Europe/Warsaw').toISODate()!),
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
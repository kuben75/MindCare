import { POLISH_MONTHS } from "@/constants/calendar";
import { useMemo, useState } from "react";
import { TCalendarReservation, TViewType } from "@/types/calendar";
import { TReservationWithService } from "@/types/reservation";
import { DateTime } from "luxon";
import { BUSINESS_TZ, floatingFromKey, floatingToKey, toFloating, todayKeyIn } from "@/lib/time";

/**
 * The admin calendar is shown in the clinic time zone (BUSINESS_TZ), whatever zone the browser
 * is in. Days and reservations are converted to "floating" dates (see lib/time) so the views can
 * keep using local getters; the original `date` (real instant) stays on each reservation.
 */
export const useAdminCalendarLogic = (initialReservations: TReservationWithService[]) => {
    const [currentDateString, setCurrentDateString] = useState<string>(todayKeyIn(BUSINESS_TZ));
    const [view, setView] = useState<TViewType>('week');

    // Calendar arithmetic on plain calendar days (no zone needed for day/week/month stepping).
    const luxonCurrent = DateTime.fromISO(currentDateString);
    const currentDate = floatingFromKey(currentDateString);

    const handleNavigate = (direction: 'prev' | 'next') => {
        const step = direction === 'next' ? 1 : -1;
        const unit = view === 'day' ? { days: step } : view === 'week' ? { weeks: step } : { months: step };
        setCurrentDateString(luxonCurrent.plus(unit).toISODate()!);
    };

    const handleToday = () => setCurrentDateString(todayKeyIn(BUSINESS_TZ));

    const getDaysOfWeek = (date: Date) => {
        const start = DateTime.fromISO(floatingToKey(date)).startOf('week');
        return Array.from({ length: 7 }, (_, i) => floatingFromKey(start.plus({ days: i }).toISODate()!));
    };

    const getDaysInMonth = (date: Date) => {
        const luxonDate = DateTime.fromISO(floatingToKey(date));
        const startOfMonth = luxonDate.startOf('month');
        const endOfMonth = luxonDate.endOf('month');
        const leading = startOfMonth.weekday - 1;

        const days = [];
        for (let i = leading; i > 0; i--) {
            days.push({ date: floatingFromKey(startOfMonth.minus({ days: i }).toISODate()!), isCurrentMonth: false });
        }
        for (let i = 0; i < endOfMonth.day; i++) {
            days.push({ date: floatingFromKey(startOfMonth.plus({ days: i }).toISODate()!), isCurrentMonth: true });
        }
        return days;
    };

    const calendarReservations: TCalendarReservation[] = useMemo(
        () => initialReservations.map((res) => ({ ...res, displayDate: toFloating(res.date, BUSINESS_TZ) })),
        [initialReservations]
    );

    const visibleReservations = calendarReservations.filter((res) => {
        if (res.status === 'CANCELLED') return false;
        const resDay = DateTime.fromISO(floatingToKey(res.displayDate));

        if (view === 'day') return resDay.hasSame(luxonCurrent, 'day');
        if (view === 'week') return resDay.hasSame(luxonCurrent, 'week');
        return resDay.hasSame(luxonCurrent, 'month');
    });

    const stats = visibleReservations.reduce((acc, res) => {
        acc.totalCount += 1;
        acc.totalMinutes += res.service.duration;
        acc.estimatedEarnings += res.amountPaid ?? res.service.price;
        if (res.status === 'PAID') acc.paidCount += 1;
        if (res.status === 'PENDING') acc.pendingCount += 1;
        return acc;
    }, { totalCount: 0, totalMinutes: 0, estimatedEarnings: 0, paidCount: 0, pendingCount: 0 });

    const formatHeaderDate = () => {
        if (view === 'day') {
            return luxonCurrent.setLocale('pl').toFormat("cccc, d MMMM yyyy");
        } else if (view === 'week') {
            const start = luxonCurrent.startOf('week');
            const end = luxonCurrent.endOf('week');
            const startMonth = POLISH_MONTHS[start.month - 1];
            const endMonth = POLISH_MONTHS[end.month - 1];
            if (start.month === end.month) {
                return `${start.day} - ${end.day} ${startMonth} ${end.year}`;
            }
            return `${start.day} ${startMonth} - ${end.day} ${endMonth} ${end.year}`;
        }
        return `${POLISH_MONTHS[luxonCurrent.month - 1]} ${luxonCurrent.year}`;
    };

    return {
        currentDate,
        setCurrentDate: (date: Date) => setCurrentDateString(floatingToKey(date)),
        view,
        handleNavigate,
        handleToday,
        visibleReservations,
        stats,
        formatHeaderDate,
        setView,
        getDaysOfWeek,
        getDaysInMonth,
    };
};

/** Today in the clinic time zone, as a floating date. */
export const adminToday = (): Date => floatingFromKey(todayKeyIn(BUSINESS_TZ));

export const isSameFloatingDay = (a: Date, b: Date) => floatingToKey(a) === floatingToKey(b);

/** Hour rows for day/week views: at least 08–20, extended to include any visit outside that range. */
export function calendarHours(reservations: TCalendarReservation[]): number[] {
    let first = 8;
    let last = 20;
    for (const r of reservations) {
        first = Math.min(first, r.displayDate.getHours());
        last = Math.max(last, r.displayDate.getHours());
    }
    return Array.from({ length: last - first + 1 }, (_, i) => first + i);
}

export const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

export const formatFloatingTime = (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

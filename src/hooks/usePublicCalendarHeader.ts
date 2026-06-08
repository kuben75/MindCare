import {useState} from "react";
import {TPublicCalendarParams} from "@/types/calendar";


export const usePublicCalendarHeader = ({ startDate, today, maxDate, jumpToDate }: TPublicCalendarParams) => {
    const [isMiniCalOpen, setIsMiniCalOpen] = useState(false);
    const [miniCalMonth, setMiniCalMonth] = useState(new Date(startDate));

    const isPrevDisabled = startDate <= today;
    const isNextDisabled = startDate >= maxDate;

    const daysInMonth = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth(), 1).getDay();
    const emptyDaysCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const handleMiniCalPrev = () => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() - 1, 1));
    const handleMiniCalNext = () => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 1));

    const handleSelectDate = (day: number) => {
        const newDate = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth(), day);
        if (newDate < today || newDate > maxDate) return;

        const yyyy = newDate.getFullYear();
        const mm = String(newDate.getMonth() + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');

        jumpToDate(`${yyyy}-${mm}-${dd}`);
        setIsMiniCalOpen(false);
    };

    return {
        isMiniCalOpen,
        setIsMiniCalOpen,
        miniCalMonth,
        setMiniCalMonth,
        isPrevDisabled,
        isNextDisabled,
        daysInMonth,
        emptyDaysCount,
        handleMiniCalPrev,
        handleMiniCalNext,
        handleSelectDate
    }
}
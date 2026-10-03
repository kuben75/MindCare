import {POLISH_MONTHS} from "@/constants/calendar";
import {DateTime} from "luxon";

export const formatDateShort = (date: Date): string => {
    return `${date.getDate()} ${POLISH_MONTHS[date.getMonth()].slice(0, 3)}`;
};

export const getDateKey = (date: Date | string): string => {
   return DateTime.fromJSDate(new Date(date)).setZone("Europe/Warsaw").toFormat("yyyy-MM-dd");
};


export const formatDateTime = (date: string | Date) => {

    const dt = DateTime.fromJSDate(new Date(date)).setZone("Europe/Warsaw");
    const monthName = POLISH_MONTHS[dt.month - 1]
        ? POLISH_MONTHS[dt.month - 1].toLowerCase()
        : String(dt.month);

    const formattedDate = `${dt.day} ${monthName} ${dt.year}`;
    const formattedTime = dt.toFormat("HH:mm");
    return { formattedDate, formattedTime };
};

export function formatPLN(value: number) {
    return value.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

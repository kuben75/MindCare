import {POLISH_MONTHS} from "@/constants/calendar";

export const formatDateShort = (date: Date): string => {
    return `${date.getDate()} ${POLISH_MONTHS[date.getMonth()].slice(0, 3)}`;
};

export const getDateKey = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};


export const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    const monthName = POLISH_MONTHS[d.getMonth()] ? POLISH_MONTHS[d.getMonth()].toLowerCase() : String(d.getMonth() + 1);
    const formattedDate = `${d.getDate()} ${monthName} ${d.getFullYear()}`;
    const formattedTime = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    return { formattedDate, formattedTime };
};

export function formatPLN(value: number) {
    return value.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

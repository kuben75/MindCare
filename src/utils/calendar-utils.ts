import {POLISH_MONTHS} from "@/constants/calendar";
import {BUSINESS_TZ, PATIENT_TZ, dateKeyIn, formatDateTimeIn} from "@/lib/time";

/** "20 lis" — expects a floating date (see lib/time `toFloating` / `floatingFromKey`). */
export const formatDateShort = (date: Date): string => {
    return `${date.getDate()} ${POLISH_MONTHS[date.getMonth()].slice(0, 3)}`;
};

/** Patient-facing calendar day ("yyyy-MM-dd", Polish time) of an instant. */
export const getDateKey = (date: Date | string): string => dateKeyIn(date, PATIENT_TZ);

/** Patient-facing date/time (Polish time) — used on reservation pages and in patient e-mails. */
export const formatDateTime = (date: string | Date) => formatDateTimeIn(date, PATIENT_TZ);

/** Clinic-facing date/time (business time zone) — used in the admin panel and admin e-mails. */
export const formatDateTimeAdmin = (date: string | Date) => formatDateTimeIn(date, BUSINESS_TZ);

export function formatPLN(value: number) {
    return value.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

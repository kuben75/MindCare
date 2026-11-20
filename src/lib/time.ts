import { DateTime } from "luxon";

/**
 * Time zone rules of the app (all instants are stored in UTC in the database):
 *  - BUSINESS_TZ — where the clinic works: weekly schedule, blocked time, admin panel,
 *    admin e-mails, finance month boundaries.
 *  - PATIENT_TZ  — what patients see: public calendar, reservation pages, patient e-mails.
 * Change these two constants and the whole app follows.
 */
export const BUSINESS_TZ = "Europe/London";
export const PATIENT_TZ = "Europe/Warsaw";

/** Length of one bookable slot in the public calendar. */
export const SLOT_MINUTES = 60;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const nowIn = (zone: string): DateTime => DateTime.now().setZone(zone);

export const toZone = (date: Date | string, zone: string): DateTime =>
    DateTime.fromJSDate(new Date(date)).setZone(zone);

/** Calendar date ("yyyy-MM-dd") of an instant as seen in `zone`. */
export const dateKeyIn = (date: Date | string, zone: string): string => toZone(date, zone).toISODate()!;

export const todayKeyIn = (zone: string): string => nowIn(zone).toISODate()!;

/** Parses "yyyy-MM-dd" as the start of that day in `zone`; null when invalid. */
export function parseDateKey(key: unknown, zone: string): DateTime | null {
    if (typeof key !== "string" || !DATE_KEY_RE.test(key)) return null;
    const dt = DateTime.fromISO(key, { zone }).startOf("day");
    return dt.isValid ? dt : null;
}

export function isValidTime(value: unknown): value is string {
    return typeof value === "string" && TIME_RE.test(value);
}

/** "HH:mm" → minutes after midnight; null when invalid. */
export function timeToMinutes(value: unknown): number | null {
    if (!isValidTime(value)) return null;
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
}

/** Instant for a wall-clock date + time in `zone` (e.g. "2026-11-20" + "18:00" in Warsaw). */
export function zonedInstant(dateKey: unknown, time: unknown, zone: string): Date | null {
    if (typeof dateKey !== "string" || !DATE_KEY_RE.test(dateKey) || !isValidTime(time)) return null;
    const dt = DateTime.fromISO(`${dateKey}T${time}`, { zone });
    return dt.isValid ? dt.toJSDate() : null;
}

/**
 * "Floating" date: a JS Date whose *browser-local* fields (getFullYear/getMonth/getDate/getDay/
 * getHours/getMinutes) equal the wall-clock time of `date` in `zone`. Lets UI code that relies on
 * local getters show the right calendar day/hour no matter where the viewer's computer is set.
 * Never send a floating date back to the server — it is not the real instant.
 */
export function toFloating(date: Date | string, zone: string): Date {
    const dt = toZone(date, zone);
    return new Date(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second);
}

/** Floating date at local midnight of a "yyyy-MM-dd" key. */
export function floatingFromKey(dateKey: string): Date {
    const [y, m, d] = dateKey.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** "yyyy-MM-dd" of a floating date (reads browser-local fields). */
export function floatingToKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export const floatingToday = (zone: string): Date => floatingFromKey(todayKeyIn(zone));

/** Intl formatting pinned to a zone — identical on the server and in every browser. */
export function formatIn(date: Date | string, zone: string, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat("pl-PL", { ...options, timeZone: zone }).format(new Date(date));
}

export const formatAdmin = (date: Date | string, options: Intl.DateTimeFormatOptions) =>
    formatIn(date, BUSINESS_TZ, options);

export const formatPatient = (date: Date | string, options: Intl.DateTimeFormatOptions) =>
    formatIn(date, PATIENT_TZ, options);

/** { formattedDate: "20 listopada 2026", formattedTime: "18:00" } in `zone`. */
export function formatDateTimeIn(date: Date | string, zone: string) {
    const dt = toZone(date, zone).setLocale("pl");
    return {
        formattedDate: dt.toFormat("d MMMM yyyy"),
        formattedTime: dt.toFormat("HH:mm"),
    };
}

/** Next calendar day ("yyyy-MM-dd", BUSINESS_TZ) falling on `dayOfWeek` (0 = Sunday … 6 = Saturday). */
export function nextBusinessDateForWeekday(dayOfWeek: number, from: Date = new Date()): string {
    const today = toZone(from, BUSINESS_TZ).startOf("day");
    const current = today.weekday % 7; // luxon: 1 = Mon … 7 = Sun → 0 = Sun
    const diff = (dayOfWeek - current + 7) % 7;
    return today.plus({ days: diff }).toISODate()!;
}

/**
 * Wall-clock time in the clinic zone → what patients see, for a given clinic date.
 * Returns null for invalid input. `dayShift` is +1/-1 when the patient's date differs.
 */
export function businessTimeToPatient(dateKey: string, time: string): { time: string; dayShift: number } | null {
    const instant = zonedInstant(dateKey, time, BUSINESS_TZ);
    if (!instant) return null;
    const patient = toZone(instant, PATIENT_TZ);
    const patientKey = patient.toISODate()!;
    const dayShift = patientKey === dateKey ? 0 : patientKey > dateKey ? 1 : -1;
    return { time: patient.toFormat("HH:mm"), dayShift };
}

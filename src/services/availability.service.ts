import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/prisma";
import { DateTime } from "luxon";
import { PENDING_HOLD_MS } from "@/constants/reservations";
import { MAX_DAYS_AHEAD } from "@/constants/calendar";
import { BUSINESS_TZ, PATIENT_TZ, SLOT_MINUTES, dateKeyIn, parseDateKey, timeToMinutes } from "@/lib/time";

type DbClient = Prisma.TransactionClient | typeof prisma;

/** Used when the WeeklySchedule table is empty. Hours are in BUSINESS_TZ. */
export const FALLBACK_SCHEDULES = [
    { dayOfWeek: 1, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 2, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 3, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 4, startTime: "17:00", endTime: "20:00", isActive: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isActive: true },
    { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isActive: true },
    { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isActive: false },
];

type DayWindow = { startMin: number; endMin: number };
type ScheduleMap = Map<number, DayWindow>;

/** Active days only, with validated times (anything malformed counts as a day off). */
async function loadSchedule(db: DbClient): Promise<ScheduleMap> {
    const rows = await db.weeklySchedule.findMany();
    const source = rows.length > 0 ? rows : FALLBACK_SCHEDULES;
    const map: ScheduleMap = new Map();
    for (const row of source) {
        if (!row.isActive) continue;
        const startMin = timeToMinutes(row.startTime);
        const endMin = timeToMinutes(row.endTime);
        if (startMin === null || endMin === null || endMin <= startMin) continue;
        map.set(row.dayOfWeek, { startMin, endMin });
    }
    return map;
}

/** Working window (in BUSINESS_TZ) of the business day that contains `day`. */
function windowFor(day: DateTime, schedule: ScheduleMap): { start: DateTime; end: DateTime } | null {
    const local = day.setZone(BUSINESS_TZ).startOf("day");
    const dayOfWeek = local.weekday === 7 ? 0 : local.weekday;
    const w = schedule.get(dayOfWeek);
    if (!w) return null;
    return { start: local.plus({ minutes: w.startMin }), end: local.plus({ minutes: w.endMin }) };
}

/**
 * Reservations that still occupy their slot: everything except CANCELLED, and except PENDING
 * online bookings older than PENDING_HOLD_MS (abandoned/spam bookings stop blocking the calendar
 * even before the daily cleanup cron runs). Manual (admin-created) bookings never expire.
 */
export function slotBlockingReservationWhere(now: Date = new Date()): Prisma.ReservationWhereInput {
    return {
        status: { not: "CANCELLED" },
        NOT: { status: "PENDING", isManual: false, createdAt: { lt: new Date(now.getTime() - PENDING_HOLD_MS) } },
    };
}

/** Whether a PENDING online booking is past its hold (its slot may already be booked by someone else). */
export function isHoldExpired(reservation: { status: string; isManual: boolean; createdAt: Date }, now = new Date()): boolean {
    return reservation.status === "PENDING" && !reservation.isManual
        && reservation.createdAt.getTime() < now.getTime() - PENDING_HOLD_MS;
}

type Busy = { start: number; end: number };

async function loadBusy(db: DbClient, from: Date, to: Date, excludeReservationId?: string): Promise<Busy[]> {
    // Look back 12h so long visits that started before `from` are still caught.
    const lookBack = new Date(from.getTime() - 12 * 60 * 60 * 1000);
    const [reservations, blocks] = await Promise.all([
        db.reservation.findMany({
            where: {
                date: { gte: lookBack, lt: to },
                ...slotBlockingReservationWhere(),
                ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
            },
            select: { date: true, service: { select: { duration: true } } },
        }),
        db.blockedTime.findMany({
            where: { startDate: { lt: to }, endDate: { gt: from } },
            select: { startDate: true, endDate: true },
        }),
    ]);
    return [
        ...reservations.map((r) => ({
            start: r.date.getTime(),
            end: r.date.getTime() + (r.service?.duration ?? SLOT_MINUTES) * 60_000,
        })),
        ...blocks.map((b) => ({ start: b.startDate.getTime(), end: b.endDate.getTime() })),
    ];
}

const overlaps = (busy: Busy[], start: number, end: number) => busy.some((b) => b.start < end && b.end > start);

export type SlotCheckReason = "INVALID" | "PAST" | "HORIZON" | "OUTSIDE_HOURS" | "OFF_GRID" | "BUSY";
export type SlotCheck = { ok: true } | { ok: false; reason: SlotCheckReason };

export const SLOT_CHECK_MESSAGES: Record<SlotCheckReason, string> = {
    INVALID: "Nieprawidłowa data wizyty.",
    PAST: "Nie można umówić wizyty w przeszłości.",
    HORIZON: `Rezerwacje są możliwe maksymalnie ${MAX_DAYS_AHEAD} dni naprzód.`,
    OUTSIDE_HOURS: "Ten termin jest poza godzinami pracy gabinetu.",
    OFF_GRID: "Wizyty online zaczynają się o pełnych terminach z kalendarza.",
    BUSY: "Ten termin nakłada się na inną wizytę lub blokadę w kalendarzu.",
};

/**
 * Validates a visit start.
 *  - mode "public": must be a slot from the public calendar (inside working hours, on the slot
 *    grid, not in the past, within the booking horizon) and free.
 *  - mode "admin": any time not in the past, only required to be free (no overlap with other
 *    visits or blocked time) — the clinic may book outside regular hours.
 */
export async function checkSlot(
    date: Date | string,
    durationMinutes: number,
    db: DbClient = prisma,
    options: { mode?: "public" | "admin"; excludeReservationId?: string } = {}
): Promise<SlotCheck> {
    const mode = options.mode ?? "public";
    const startDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(startDate.getTime()) || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        return { ok: false, reason: "INVALID" };
    }

    const start = DateTime.fromJSDate(startDate).setZone(BUSINESS_TZ);
    const end = start.plus({ minutes: durationMinutes });
    const now = DateTime.now();

    if (start < now.minus({ minutes: mode === "admin" ? 5 : 0 })) return { ok: false, reason: "PAST" };

    if (mode === "public") {
        const horizon = now.setZone(PATIENT_TZ).plus({ days: MAX_DAYS_AHEAD }).endOf("day");
        if (start > horizon) return { ok: false, reason: "HORIZON" };

        const window = windowFor(start, await loadSchedule(db));
        if (!window || start < window.start || end > window.end) return { ok: false, reason: "OUTSIDE_HOURS" };

        const offsetMin = start.diff(window.start, "minutes").minutes;
        if (start.second !== 0 || start.millisecond !== 0 || offsetMin % SLOT_MINUTES !== 0) {
            return { ok: false, reason: "OFF_GRID" };
        }
    }

    const busy = await loadBusy(db, start.toJSDate(), end.toJSDate(), options.excludeReservationId);
    if (overlaps(busy, start.toMillis(), end.toMillis())) return { ok: false, reason: "BUSY" };

    return { ok: true };
}

/** Public booking check (kept as a boolean for existing callers). */
export async function isSlotAvailable(date: Date | string, durationMinutes: number, db: DbClient = prisma): Promise<boolean> {
    return (await checkSlot(date, durationMinutes, db, { mode: "public" })).ok;
}

export type PublicSlot = { id: string; time: string; startsAt: string; available: boolean; type: "online" };
export type PublicDay = { dateKey: string; date: string; isToday: boolean; slots: PublicSlot[] };

/**
 * Public calendar: `days` consecutive days in PATIENT_TZ starting at `startKey`. Slots are generated
 * from the BUSINESS_TZ schedule and labelled in PATIENT_TZ. Availability uses the same rules as
 * `checkSlot` (public mode) so the calendar never offers a slot the booking endpoint rejects.
 */
export async function getPublicSlots(startKey: string, days: number = MAX_DAYS_AHEAD, db: DbClient = prisma): Promise<PublicDay[] | null> {
    const firstDay = parseDateKey(startKey, PATIENT_TZ);
    if (!firstDay) return null;

    const rangeStart = firstDay;
    const rangeEnd = firstDay.plus({ days });
    const now = DateTime.now();
    const horizon = now.setZone(PATIENT_TZ).plus({ days: MAX_DAYS_AHEAD }).endOf("day");
    const todayKey = now.setZone(PATIENT_TZ).toISODate();

    const [schedule, busy] = await Promise.all([
        loadSchedule(db),
        loadBusy(db, rangeStart.toJSDate(), rangeEnd.plus({ hours: 24 }).toJSDate()),
    ]);

    const result: PublicDay[] = [];
    const byKey = new Map<string, PublicDay>();
    for (let i = 0; i < days; i++) {
        const day = firstDay.plus({ days: i });
        const entry: PublicDay = {
            dateKey: day.toISODate()!,
            date: day.toUTC().toISO()!,
            isToday: day.toISODate() === todayKey,
            slots: [],
        };
        result.push(entry);
        byKey.set(entry.dateKey, entry);
    }

    // Walk business days covering the patient range (±1 day for the zone offset).
    let businessDay = rangeStart.setZone(BUSINESS_TZ).startOf("day").minus({ days: 1 });
    const lastBusinessDay = rangeEnd.setZone(BUSINESS_TZ).startOf("day").plus({ days: 1 });
    while (businessDay <= lastBusinessDay) {
        const window = windowFor(businessDay, schedule);
        if (window) {
            for (let slot = window.start; slot.plus({ minutes: SLOT_MINUTES }) <= window.end; slot = slot.plus({ minutes: SLOT_MINUTES })) {
                if (slot < rangeStart || slot >= rangeEnd) continue;
                const key = dateKeyIn(slot.toJSDate(), PATIENT_TZ);
                const day = byKey.get(key);
                if (!day) continue;
                const time = slot.setZone(PATIENT_TZ).toFormat("HH:mm");
                const startMs = slot.toMillis();
                day.slots.push({
                    id: `${key}-${time}`,
                    time,
                    startsAt: slot.toUTC().toISO()!,
                    available: slot >= now && slot <= horizon
                        && !overlaps(busy, startMs, startMs + SLOT_MINUTES * 60_000),
                    type: "online",
                });
            }
        }
        businessDay = businessDay.plus({ days: 1 });
    }

    for (const day of result) day.slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return result;
}

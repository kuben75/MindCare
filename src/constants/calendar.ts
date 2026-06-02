import {ReservationStatus} from "@prisma/client";
import {TViewType} from "@/types/calendar";

export const MINI_CAL_DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

export const POLISH_MONTHS = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];
export const POLISH_DAYS_SHORT = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];

export const DAYS_PER_VIEW_MOBILE = 3;

export const DAYS_PER_VIEW_DESKTOP = 6;

export const MAX_DAYS_AHEAD = 30;

export const DAYS_NAMES = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
export const HOURS = Array.from({length: 13}, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
export const WEEKDAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

export const STATUS_STYLES: Record<ReservationStatus, { bg: string, text: string, border: string, dot: string }> = {
    PAID: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-900/50', dot: 'bg-emerald-500' },
    PENDING: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-900/50', dot: 'bg-amber-500' },
    COMPLETED: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-900/50', dot: 'bg-blue-500' },
    CANCELLED: { bg: 'bg-zinc-50 dark:bg-zinc-900/40', text: 'text-zinc-500 dark:text-zinc-400', border: 'border-zinc-200/60 dark:border-zinc-800', dot: 'bg-zinc-400' }
};


export const VIEW_LABELS: Record<TViewType, string> = { day: 'Dzień', week: 'Tydzień', month: 'Miesiąc' };
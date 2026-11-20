export const TAB_LABELS = { upcoming: 'Nadchodzące', history: 'Historia', cancelled: 'Anulowane' };
/** Unpaid (PENDING) reservations hold their slot this long, then the cleanup cron cancels them. */
export const PENDING_HOLD_HOURS = 72;
export const PENDING_HOLD_MS = PENDING_HOLD_HOURS * 60 * 60 * 1000;

/** Default phone written into ClinicSettings on first run — never show it to patients. */
export const PLACEHOLDER_CLINIC_PHONE = "+48 000 000 000";

export function realClinicPhone(phone: string | null | undefined): string | null {
    const trimmed = phone?.trim();
    return trimmed && trimmed !== PLACEHOLDER_CLINIC_PHONE ? trimmed : null;
}

/**
 * Allowed admin status changes. CANCELLED and COMPLETED are final; a paid visit can't go back to
 * PENDING (the cleanup cron would cancel it and tell the patient it was unpaid) and an unpaid one
 * can't jump to COMPLETED (it would count as revenue).
 */
export const STATUS_TRANSITIONS: Record<string, readonly string[]> = {
    PENDING: ["PAID", "CANCELLED"],
    PAID: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
};

export const STATUS_LABELS: Record<string, string> = {
    PENDING: "Oczekująca",
    PAID: "Opłacona",
    COMPLETED: "Zakończona",
    CANCELLED: "Anulowana",
};

export function canTransition(from: string, to: string): boolean {
    return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

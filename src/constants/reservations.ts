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

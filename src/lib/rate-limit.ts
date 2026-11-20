import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

type RateLimitResult = {
    success: boolean;
    remaining: number;
};

const HOUR_MS = 60 * 60 * 1000;

/**
 * Counts SystemLog entries with the given action from this IP inside the window.
 * Requests without a known IP share a single "unknown-ip" bucket with a stricter limit
 * instead of being unlimited.
 */
async function checkLogBasedLimit(
    action: string,
    ip: string,
    maxPerWindow: number,
    windowMs: number,
    db: DbClient = prisma
): Promise<RateLimitResult> {
    const bucket = ip || "unknown-ip";
    const limit = bucket === "unknown-ip" ? Math.max(1, Math.floor(maxPerWindow / 2)) : maxPerWindow;

    const recentCount = await db.systemLog.count({
        where: {
            action,
            ipAddress: bucket,
            createdAt: { gte: new Date(Date.now() - windowMs) },
        },
    });

    if (recentCount >= limit) {
        return { success: false, remaining: 0 };
    }
    return { success: true, remaining: limit - recentCount };
}

const MAX_RESERVATIONS_PER_HOUR = 3;
const MAX_RESERVATIONS_PER_DAY = 6;

export const RESERVATION_LOG_ACTION = "REZERWACJA_WSTĘPNA";

/**
 * Pass the transaction client when checking inside the booking transaction: together with the
 * log row written in the same Serializable transaction this makes the limit race-free.
 */
export async function checkReservationRateLimit(ip: string, db: DbClient = prisma): Promise<RateLimitResult> {
    const hourly = await checkLogBasedLimit(RESERVATION_LOG_ACTION, ip, MAX_RESERVATIONS_PER_HOUR, HOUR_MS, db);
    if (!hourly.success) return hourly;
    const daily = await checkLogBasedLimit(RESERVATION_LOG_ACTION, ip, MAX_RESERVATIONS_PER_DAY, 24 * HOUR_MS, db);
    return daily.success ? hourly : daily;
}

export const WAITLIST_LOG_ACTION = "ZAPIS_LISTA_OCZEKUJACYCH";
const MAX_WAITLIST_PER_HOUR = 5;

export async function checkWaitlistRateLimit(ip: string): Promise<RateLimitResult> {
    return checkLogBasedLimit(WAITLIST_LOG_ACTION, ip, MAX_WAITLIST_PER_HOUR, HOUR_MS);
}

import prisma from "@/infrastructure/prisma";

type RateLimitResult = {
    success: boolean;
    remaining: number;
};

const MAX_RESERVATIONS_PER_HOUR = 3;

export async function checkReservationRateLimit(ip: string): Promise<RateLimitResult> {
    if (!ip || ip === "unknown-ip") {
        return { success: true, remaining: MAX_RESERVATIONS_PER_HOUR };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentCount = await prisma.systemLog.count({
        where: {
            action: "REZERWACJA_WSTĘPNA",
            ipAddress: ip,
            createdAt: {
                gte: oneHourAgo,
            },
        },
    });

    if (recentCount >= MAX_RESERVATIONS_PER_HOUR) {
        return { success: false, remaining: 0 };
    }

    return {
        success: true,
        remaining: MAX_RESERVATIONS_PER_HOUR - recentCount,
    };
}
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/infrastructure/prisma";

function isAuthorizedCron(req: Request): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return false;

    const authHeader = req.headers.get("authorization") || "";
    const expected = `Bearer ${cronSecret}`;

    if (authHeader.length !== expected.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
}

export async function GET(req: Request) {
    if (!isAuthorizedCron(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const expired = await prisma.reservation.updateMany({
            where: {
                status: "PENDING",
                OR: [
                    { createdAt: { lt: twentyFourHoursAgo } },
                    { date: { lt: now } },
                ],
            },
            data: {
                status: "CANCELLED",
            },
        });

        if (expired.count > 0) {
            await prisma.systemLog.create({
                data: {
                    action: "CRON_CLEANUP_PENDING",
                    details: `Automatycznie anulowano wygasłe rezerwacje PENDING: ${expired.count}`,
                },
            });
        }

        return NextResponse.json({ success: true, cancelledCount: expired.count });
    } catch (error) {
        console.error("Błąd crona cleanup-pending:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
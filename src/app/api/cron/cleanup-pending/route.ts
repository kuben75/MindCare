import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { isAuthorizedCron } from "@/lib/request-security";
import { PENDING_HOLD_HOURS, PENDING_HOLD_MS } from "@/constants/reservations";
import { sendCancellationEmail } from "@/utils/email-sender";

export async function GET(req: Request) {
    if (!isAuthorizedCron(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const holdCutoff = new Date(now.getTime() - PENDING_HOLD_MS);

        const expiredWhere = {
            status: "PENDING" as const,
            OR: [
                { createdAt: { lt: holdCutoff } },
                { date: { lt: now } },
            ],
        };

        const expiredReservations = await prisma.reservation.findMany({
            where: expiredWhere,
            include: { service: { select: { name: true } } },
        });

        if (expiredReservations.length === 0) {
            return NextResponse.json({ success: true, cancelledCount: 0 });
        }

        // Conditional on status=PENDING, so a reservation marked as paid in the meantime is left alone.
        const expired = await prisma.reservation.updateMany({
            where: { id: { in: expiredReservations.map((r) => r.id) }, status: "PENDING" },
            data: { status: "CANCELLED" },
        });

        await prisma.systemLog.create({
            data: {
                action: "CRON_CLEANUP_PENDING",
                details: `Automatycznie anulowano nieopłacone rezerwacje (brak płatności w ciągu ${PENDING_HOLD_HOURS}h lub termin minął): ${expired.count}`,
            },
        });

        // Tell patients whose (still upcoming) slot was released; past-dated ones are just closed.
        const upcoming = expiredReservations.filter((r) => r.date > now);
        await Promise.allSettled(
            upcoming.map((r) =>
                sendCancellationEmail({
                    email: r.email,
                    patientName: r.patientName,
                    date: r.date,
                    serviceName: r.service.name,
                    reason: `Rezerwacja nie została opłacona w ciągu ${PENDING_HOLD_HOURS} godzin, dlatego termin został zwolniony. Jeśli nadal chcesz się umówić, zarezerwuj nowy termin lub skontaktuj się z gabinetem.`,
                })
            )
        );

        return NextResponse.json({ success: true, cancelledCount: expired.count });
    } catch (error) {
        console.error("Błąd crona cleanup-pending:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

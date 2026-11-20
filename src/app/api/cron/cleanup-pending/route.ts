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

        // Online bookings unpaid past the hold, plus any unpaid booking whose date has passed.
        // Manual (admin-created) bookings are never auto-cancelled before their date — payment for
        // those is arranged individually.
        const expiredReservations = await prisma.reservation.findMany({
            where: {
                status: "PENDING",
                OR: [
                    { isManual: false, createdAt: { lt: holdCutoff } },
                    { date: { lt: now } },
                ],
            },
            include: { service: { select: { name: true } } },
        });

        // Cancel one by one, conditional on still being PENDING, so a booking marked as paid in
        // the meantime is left alone and its patient gets no "slot released" e-mail.
        const cancelled: typeof expiredReservations = [];
        for (const reservation of expiredReservations) {
            const result = await prisma.reservation.updateMany({
                where: { id: reservation.id, status: "PENDING" },
                data: { status: "CANCELLED" },
            });
            if (result.count === 1) cancelled.push(reservation);
        }

        if (cancelled.length > 0) {
            await prisma.systemLog.create({
                data: {
                    action: "CRON_CLEANUP_PENDING",
                    details: `Automatycznie anulowano nieopłacone rezerwacje (brak płatności w ciągu ${PENDING_HOLD_HOURS}h lub termin minął): ${cancelled.length}`,
                },
            });
        }

        // Tell patients whose (still upcoming) slot was released; past-dated ones are just closed.
        await Promise.allSettled(
            cancelled
                .filter((r) => r.date > now)
                .map((r) =>
                    sendCancellationEmail({
                        email: r.email,
                        patientName: r.patientName,
                        date: r.date,
                        serviceName: r.service.name,
                        reason: `Rezerwacja nie została opłacona w ciągu ${PENDING_HOLD_HOURS} godzin, dlatego termin został zwolniony. Jeśli nadal chcesz się umówić, zarezerwuj nowy termin lub skontaktuj się z gabinetem.`,
                    })
                )
        );

        return NextResponse.json({ success: true, cancelledCount: cancelled.length });
    } catch (error) {
        console.error("Błąd crona cleanup-pending:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

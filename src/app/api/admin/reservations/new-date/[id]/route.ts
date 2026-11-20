import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import prisma from "@/infrastructure/prisma";
import {sendRescheduleEmail} from "@/utils/email-sender";
import {requireAdmin} from "@/lib/requireAdmin";
import {checkSlot, SLOT_CHECK_MESSAGES} from "@/services/availability.service";

class RescheduleError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        const newDate = typeof body?.date === "string" ? new Date(body.date) : null;
        const {id} = await params;

        if (!newDate || Number.isNaN(newDate.getTime())) {
            return NextResponse.json({error: "Podaj poprawną nową datę wizyty."}, {status: 400});
        }

        const updated = await prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findUnique({ where: { id }, include: { service: true } });
            if (!reservation) throw new RescheduleError(404, "Nie znaleziono rezerwacji.");
            if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED") {
                throw new RescheduleError(400, "Nie można zmienić daty wizyty anulowanej lub zakończonej.");
            }

            // Real overlap check (duration-aware, includes blocked time), excluding this visit.
            const slot = await checkSlot(newDate, reservation.service.duration, tx, { mode: "admin", excludeReservationId: id });
            if (!slot.ok) throw new RescheduleError(409, SLOT_CHECK_MESSAGES[slot.reason]);

            return tx.reservation.update({
                where: { id },
                data: { date: newDate, rescheduleRequested: false },
                include: { service: true },
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        const sent = await sendRescheduleEmail({
            email: updated.email,
            patientName: updated.patientName,
            date: updated.date,
            serviceName: updated.service.name,
            magicToken: updated.magicToken,
            status: updated.status,
        });

        return NextResponse.json({
            success: true,
            reservation: updated,
            warning: sent ? undefined : "Nie udało się wysłać pacjentowi e-maila o nowym terminie.",
        });
    } catch (error) {
        if (error instanceof RescheduleError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2034") {
            return NextResponse.json({ error: "Kalendarz był właśnie zmieniany. Spróbuj ponownie." }, { status: 409 });
        }
        return NextResponse.json({error: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}

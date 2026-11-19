import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { sendCancellationEmail, sendMagicLinkEmail } from "@/utils/email-sender";
import {requireAdmin} from "@/lib/requireAdmin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const resolvedParams = await params;
        const resolvedReservationId = resolvedParams.id;

        const body = await req.json();
        const { status } = body;

        const validStatuses = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 });
        }

        const currentReservation = await prisma.reservation.findUnique({
            where: { id: resolvedReservationId },
            include: { service: true }
        });

        if (!currentReservation) {
            return NextResponse.json({ error: 'Nie znaleziono rezerwacji' }, { status: 404 });
        }
        if (currentReservation.status === 'CANCELLED') {
            return NextResponse.json({ error: 'Ta rezerwacja została już anulowana i zamknięta. Nie można zmienić jej statusu.' }, { status: 400 });
        }

        if (currentReservation.status === 'COMPLETED' && status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Zakończona wizyta nie może zmienić statusu na wcześniejszy.' }, { status: 400 });
        }

        const wasPaid = currentReservation.status === 'PAID';

        const updatedReservation = await prisma.reservation.update({
            where: { id: resolvedReservationId },
            data: { status },
            include: { service: true }
        });

        if (status === 'PAID' && currentReservation.status === 'PENDING') {
            // Payment is settled outside the app (after contacting the clinic) — confirm it to the patient.
            await prisma.systemLog.create({
                data: {
                    action: "PŁATNOŚĆ_ZAKSIĘGOWANA_RĘCZNIE",
                    details: `Admin oznaczył rezerwację ${updatedReservation.id} (${updatedReservation.patientName}) jako opłaconą.`
                }
            });

            await sendMagicLinkEmail({
                email: updatedReservation.email,
                patientName: updatedReservation.patientName,
                date: updatedReservation.date,
                serviceName: updatedReservation.service.name,
                magicToken: updatedReservation.magicToken,
                status: "PAID"
            });
        }

        if (status === 'CANCELLED') {
            if (wasPaid) {
                await prisma.systemLog.create({
                    data: {
                        action: "WYMAGANY_ZWROT_RĘCZNY",
                        details: `Admin anulował opłaconą wizytę ${updatedReservation.id} (${updatedReservation.patientName}). Pamiętaj o ręcznym zwrocie ${updatedReservation.service.price} zł.`
                    }
                });
            }

            const cancellationReason = wasPaid
                ? "Odwołano przez gabinet. Skontaktujemy się z Tobą w sprawie zwrotu opłaty."
                : "Odwołano przez gabinet";

            await sendCancellationEmail({
                email: updatedReservation.email,
                patientName: updatedReservation.patientName,
                date: updatedReservation.date,
                serviceName: updatedReservation.service.name,
                reason: cancellationReason
            });
        }

        return NextResponse.json(updatedReservation, { status: 200 });

    } catch  {
        return NextResponse.json({ error: 'Nie można zaktualizować rezerwacji' }, { status: 500 });
    }
}
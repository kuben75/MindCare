import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { sendCancellationEmail } from "@/utils/email-sender";
import { stripe } from "@/infrastructure/stripe";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Brak uprawnień. Akcja wymaga zalogowania." }, { status: 401 });
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

        let refundSuccessful = false;

        if (status === 'CANCELLED' && currentReservation.status === 'PAID' && currentReservation.stripePaymentIntentId) {
            try {
                await stripe.refunds.create({
                    payment_intent: currentReservation.stripePaymentIntentId,
                    reason: 'requested_by_customer'
                });

                refundSuccessful = true;

                await prisma.systemLog.create({
                    data: {
                        action: "ZWROT_ŚRODKÓW_ADMIN",
                        details: `Admin anulował wizytę ${currentReservation.id}. Pomyślnie zwrócono środki (${currentReservation.service.price} zł)`
                    }
                });
            } catch (stripeError) {
                const error = stripeError instanceof Error ? stripeError.message : "Nieznany błąd";
                await prisma.systemLog.create({
                    data: {
                        action: "BŁĄD_ZWROTU_ADMIN",
                        details: `Admin anulował wizytę, ale zwrot środków na Stripe zawiódł. ID: ${currentReservation.id}. Błąd: ${error}`
                    }
                });
                return NextResponse.json({ error: "Nie można wykonać zwrotu na Stripe. Status nie został zmieniony." }, { status: 500 });
            }
        }

        const updatedReservation = await prisma.reservation.update({
            where: { id: resolvedReservationId },
            data: { status },
            include: { service: true }
        });

        if (status === 'CANCELLED') {
            const cancellationReason = refundSuccessful
                ? "Odwołano przez gabinet. Środki zostały zwrócone na Twoje konto."
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

    } catch (e) {
        return NextResponse.json({ error: 'Nie można zaktualizować rezerwacji' }, { status: 500 });
    }
}
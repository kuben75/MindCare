import { NextResponse } from "next/server";
import { stripe } from "@/infrastructure/stripe";
import prisma from "@/infrastructure/prisma";
import { sendMagicLinkEmail, sendNewReservationAdminAlert } from "@/utils/email-sender";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error("Brak sygnatury lub klucza webhooka");
        }
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Nieznany błąd podczas weryfikacji webhooka";
        await prisma.systemLog.create({
            data: {
                action: "BŁĄD_WEBHOOK_SYGNATURA",
                details: `Powód: ${errorMessage}`
            }
        });
        return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const reservationId = session.client_reference_id;

        const paymentIntentId = session.payment_intent as string;

        if (reservationId) {
            try {
                const updatedReservation = await prisma.reservation.update({
                    where: { id: reservationId },
                    data: {
                        status: 'PAID',
                        stripePaymentIntentId: paymentIntentId
                    },
                    include: { service: true }
                });

                await prisma.systemLog.create({
                    data: {
                        action: "PŁATNOŚĆ_ZAKOŃCZONA",
                        details: `Sukces. Rezerwacja: ${reservationId} | Pacjent: ${updatedReservation.email}`
                    }
                });
                const settings = await prisma.clinicSettings.findUnique({
                    where: { id: "global" }
                });
                const adminEmail = settings?.email || "jakub.lawniczak753@gmail.com";

                await Promise.allSettled([
                    sendMagicLinkEmail({
                        email: updatedReservation.email,
                        patientName: updatedReservation.patientName,
                        date: updatedReservation.date,
                        serviceName: updatedReservation.service.name,
                        magicToken: updatedReservation.magicToken
                    }),
                    sendNewReservationAdminAlert({
                        adminEmail: adminEmail,
                        patientName: updatedReservation.patientName,
                        date: updatedReservation.date,
                        serviceName: updatedReservation.service.name
                    })
                ]);

            } catch (err) {
                await prisma.systemLog.create({
                    data: {
                        action: "BŁĄD_WEBHOOK_PRZETWARZANIE",
                        details: `KRYTYCZNE! Płatność przeszła, ale kod zawiódł. Rezerwacja: ${reservationId} | Błąd: ${err instanceof Error ? err.message : "Nieznany błąd"}`
                    }
                });
            }
        }else {
            await prisma.systemLog.create({
                data: {
                    action: "BŁĄD_WEBHOOK_BRAK_ID",
                    details: `Otrzymano płatność, ale brakuje client_reference_id! Stripe Session ID: ${session.id}`
                }
            });
        }
    }

    return new NextResponse("OK", { status: 200 });
}
import { NextResponse } from "next/server";
import { stripe } from "@/infrastructure/stripe";
import prisma from "@/infrastructure/prisma";
import {
    getClinicNotificationEmail,
    sendMagicLinkEmail,
    sendNewReservationAdminAlert,
} from "@/utils/email-sender";
import Stripe from "stripe";

async function log(action: string, details: string) {
    await prisma.systemLog.create({ data: { action, details } });
}

/**
 * Marks the reservation as PAID only when:
 *  - Stripe reports the session as actually paid,
 *  - the paid amount/currency matches the service price,
 *  - the reservation is still PENDING (a cancelled/expired reservation gets refunded instead).
 * Re-delivered events for an already PAID reservation are acknowledged without side effects.
 */
async function handlePaidSession(session: Stripe.Checkout.Session) {
    const reservationId = session.client_reference_id || session.metadata?.reservationId;

    if (!reservationId) {
        await log("BŁĄD_WEBHOOK_BRAK_ID", `Otrzymano płatność, ale brakuje client_reference_id! Stripe Session ID: ${session.id}`);
        return;
    }

    if (session.payment_status !== "paid") {
        // Delayed payment methods: wait for checkout.session.async_payment_succeeded.
        await log("PŁATNOŚĆ_OCZEKUJĄCA", `Sesja ${session.id} (rezerwacja ${reservationId}) ma status płatności: ${session.payment_status}`);
        return;
    }

    const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { service: true },
    });

    if (!reservation) {
        await log("BŁĄD_WEBHOOK_PRZETWARZANIE", `KRYTYCZNE! Płatność ${session.id} dla nieistniejącej rezerwacji ${reservationId}.`);
        return;
    }

    if (reservation.status === "PAID" || reservation.status === "COMPLETED") {
        return; // duplicate delivery — already processed
    }

    const expectedAmount = Math.round(reservation.service.price * 100);
    if (session.amount_total !== expectedAmount || session.currency?.toLowerCase() !== "pln") {
        await log(
            "BŁĄD_WEBHOOK_KWOTA",
            `KRYTYCZNE! Rezerwacja ${reservationId}: zapłacono ${session.amount_total} ${session.currency}, oczekiwano ${expectedAmount} pln. Status nie został zmieniony – wymagana weryfikacja ręczna.`
        );
        return;
    }

    if (reservation.status === "CANCELLED") {
        // The slot may already belong to someone else — never resurrect the booking, refund instead.
        if (paymentIntentId) {
            try {
                await stripe.refunds.create(
                    { payment_intent: paymentIntentId, reason: "requested_by_customer" },
                    { idempotencyKey: `refund_cancelled_${reservation.id}_${paymentIntentId}` }
                );
                await log("ZWROT_PŁATNOŚCI_PO_ANULOWANIU", `Rezerwacja ${reservationId} była już anulowana w chwili płatności (${session.id}). Środki zwrócone automatycznie.`);
            } catch (err) {
                await log("BŁĄD_ZWROTU_STRIPE", `KRYTYCZNE! Płatność dla anulowanej rezerwacji ${reservationId}, automatyczny zwrot nie powiódł się: ${err instanceof Error ? err.message : "Nieznany błąd"}`);
            }
        } else {
            await log("WYMAGANY_ZWROT_RĘCZNY", `Płatność ${session.id} dla anulowanej rezerwacji ${reservationId} bez payment_intent – wymagany zwrot ręczny.`);
        }
        return;
    }

    // Conditional update guards against a concurrent cancel/cleanup between read and write.
    const updated = await prisma.reservation.updateMany({
        where: { id: reservationId, status: "PENDING" },
        data: { status: "PAID", stripePaymentIntentId: paymentIntentId },
    });

    if (updated.count === 0) {
        await log("BŁĄD_WEBHOOK_PRZETWARZANIE", `Rezerwacja ${reservationId} zmieniła status w trakcie przetwarzania płatności ${session.id} – wymagana weryfikacja ręczna.`);
        return;
    }

    await log("PŁATNOŚĆ_ZAKOŃCZONA", `Sukces. Rezerwacja: ${reservationId} | Pacjent: ${reservation.email}`);

    const adminEmail = await getClinicNotificationEmail();
    await Promise.allSettled([
        sendMagicLinkEmail({
            email: reservation.email,
            patientName: reservation.patientName,
            date: reservation.date,
            serviceName: reservation.service.name,
            magicToken: reservation.magicToken,
        }),
        sendNewReservationAdminAlert({
            adminEmail,
            patientName: reservation.patientName,
            date: reservation.date,
            serviceName: reservation.service.name,
        }),
    ]);
}

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
        // Not written to SystemLog: unauthenticated requests must not be able to flood the audit log.
        console.warn("Odrzucono webhook Stripe:", error instanceof Error ? error.message : error);
        return new NextResponse("Webhook Error: invalid signature", { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
                await handlePaidSession(event.data.object as Stripe.Checkout.Session);
                break;
            case "checkout.session.async_payment_failed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await log("PŁATNOŚĆ_NIEUDANA", `Płatność asynchroniczna nie powiodła się. Sesja ${session.id}, rezerwacja ${session.client_reference_id ?? "?"}`);
                break;
            }
        }
    } catch (err) {
        await log(
            "BŁĄD_WEBHOOK_PRZETWARZANIE",
            `KRYTYCZNE! Błąd przetwarzania zdarzenia ${event.id} (${event.type}): ${err instanceof Error ? err.message : "Nieznany błąd"}`
        );
        // 500 makes Stripe retry the delivery; handlers are idempotent.
        return new NextResponse("Processing error", { status: 500 });
    }

    return new NextResponse("OK", { status: 200 });
}

import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { reservationSchema } from "@/schemas/reservation";
import {stripe} from "@/infrastructure/stripe";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validation = reservationSchema.safeParse(body);

        if (!validation.success) {
            const firstErrorMessage = validation.error.issues[0].message;
            return NextResponse.json({ error: firstErrorMessage }, { status: 400 });
        }

        const { patientName, email, phone, serviceId, date, termsAccepted } = validation.data;

        const existingReservation = await prisma.reservation.findFirst({
            where: {
                date: date,
                status: {
                    not: "CANCELLED"
                }
            }
        });

        if (existingReservation) {
            return NextResponse.json({ error: "Przepraszamy, ten termin został właśnie zarezerwowany przez kogoś innego. Wybierz inną godzinę." }, { status: 409 });
        }

        const newReservation = await prisma.reservation.create({
            data: {
                patientName: patientName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone,
                date: date,
                serviceId,
                status: "PENDING",
                hasAcceptedTerms: termsAccepted,
            },
            include: {
                service: true
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'revolut_pay', 'p24'],
            customer_email: newReservation.email,
            client_reference_id: newReservation.id,
            metadata: {
                reservationId: newReservation.id
            },
            line_items: [
                {
                    price_data: {
                        currency: 'pln',
                        product_data: {
                            name: newReservation.service.name,
                            description: `Wizyta zaplanowana na: ${new Date(date).toLocaleDateString('pl-PL')} o ${new Date(date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`
                        },
                        unit_amount: Math.round(newReservation.service.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/reservation/success?token=${newReservation.magicToken}`,
            cancel_url: `${baseUrl}/reservation/failed?token=${newReservation.magicToken}`,
        });

        if (!stripeSession.url) {
            return NextResponse.json({ error: "Błąd podczas generowania płatności. Skontaktuj się z gabinetem." }, { status: 500 });
        }
        await prisma.systemLog.create({
            data: {
                action: "PŁATNOŚĆ_INICJACJA",
                details: `Rezerwacja: ${newReservation.id} | Email: ${newReservation.email} | Sesja Stripe: ${stripeSession.id}`,
            }
        });

        return NextResponse.json({ url: stripeSession.url }, { status: 201 });

    } catch (e) {
        return NextResponse.json({ error: "Wystąpił błąd podczas tworzenia rezerwacji" }, { status: 500 });
    }
}
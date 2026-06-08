import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { stripe } from "@/infrastructure/stripe";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) return NextResponse.json({ message: "Brak tokenu" }, { status: 400 });

        const reservation = await prisma.reservation.findUnique({
            where: { magicToken: token },
            include: { service: true }
        });

        if (!reservation || reservation.status !== 'PENDING') {
            return NextResponse.json({ message: "Nie można ponowić płatności dla tej rezerwacji" }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'revolut_pay', 'p24'],
            customer_email: reservation.email,
            client_reference_id: reservation.id,
            metadata: { reservationId: reservation.id },
            line_items: [
                {
                    price_data: {
                        currency: 'pln',
                        product_data: {
                            name: reservation.service.name,
                            description: `Wizyta zaplanowana na: ${new Date(reservation.date).toLocaleDateString('pl-PL')} o ${new Date(reservation.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`
                        },
                        unit_amount: Math.round(reservation.service.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/reservation/success?token=${reservation.magicToken}`,
            cancel_url: `${baseUrl}/reservation/failed?token=${reservation.magicToken}`,
        });

        if (!stripeSession.url) throw new Error("Brak URL sesji Stripe");

        await prisma.systemLog.create({
            data: {
                action: "PŁATNOŚĆ_PONOWIENIE",
                details: `Rezerwacja: ${reservation.id} | Pacjent zechciał spróbować ponownie.`
            }
        });

        return NextResponse.json({ url: stripeSession.url }, { status: 200 });

    } catch  {
        return NextResponse.json({ message: "Wystąpił błąd serwera. Spróbuj ponownie później." }, { status: 500 });
    }
}
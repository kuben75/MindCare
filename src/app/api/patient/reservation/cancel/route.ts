import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {sendCancellationEmail} from "@/utils/email-sender";
import {stripe} from "@/infrastructure/stripe";


export async function POST(req: Request) {
    try {
        const {token} = await req.json();

        if(!token) {
            return NextResponse.json({message: "Token is required"}, {status: 400});
        }

        const reservation = await prisma.reservation.findUnique({
            where: {magicToken: token},
            include: { service: true }
        });
        if(!reservation) {
            return NextResponse.json({message: "Nie znaleziono rezerwacji"}, {status: 404});
        }

        if(reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
            return NextResponse.json({message: "Nie można anulować tej rezerwacji"}, {status: 400});
        }

        const now = new Date();
        const reservationDate = new Date(reservation.date);
        const timeDiff = reservationDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        const isEligibleForRefund = hoursDiff >= 24;
        let refundSuccessful = false;

        if(reservation.status === 'PAID' && reservation.stripePaymentIntentId && isEligibleForRefund) {
            try{
                await stripe.refunds.create({
                    payment_intent: reservation.stripePaymentIntentId,
                    reason: 'requested_by_customer'
                });
                refundSuccessful = true;

                await prisma.systemLog.create({
                    data: {
                        action: "ZWROT_ŚRODKÓW_STRIPE",
                        details: `Pomyślnie zwrócono środki dla rezerwacji ${reservation.id} (${reservation.service.price} zł)`
                    }
                })
            }catch (stripeError) {
                const error = stripeError instanceof Error ? stripeError.message : "Nieznany błąd";

                await prisma.systemLog.create({
                    data: {
                        action: "BŁĄD_ZWROTU_STRIPE",
                        details: `Nie udało się zwrócić środków dla ${reservation.id}. Błąd: ${error}`
                    }
                });
                return NextResponse.json({ message: "Błąd podczas procesowania zwrotu płatności. Skontaktuj się z gabinetem." }, { status: 500 });
            }
        }
        if (reservation.status === 'PAID' && !isEligibleForRefund) {
            await prisma.systemLog.create({
                data: {
                    action: "ANULOWANIE_BEZ_ZWROTU",
                    details: `Pacjent odwołał rezerwację ${reservation.id} poniżej 24h przed terminem (${hoursDiff.toFixed(1)}h). Środki zatrzymane.`
                }
            });
        }
        const canceledRes = await prisma.reservation.update({
            where: {id: reservation.id},
            data: {status: 'CANCELLED'},
                include: { service: true}
        });

        const cancellationReason = refundSuccessful
            ? "Odwołano przez pacjenta. Środki zostały zwrócone na kartę."
            : reservation.status === 'PAID'
                ? "Odwołano przez pacjenta na mniej niż 24h przed terminem. Zgodnie z regulaminem środki nie podlegają zwrotowi."
                : "Odwołano przez pacjenta";

        await sendCancellationEmail({
            email: canceledRes.email,
            patientName: canceledRes.patientName,
            date: canceledRes.date,
            serviceName: canceledRes.service.name,
            reason: cancellationReason
        })

        return NextResponse.json({success: true}, {status: 200});

    }catch (e) {
        return NextResponse.json({message: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}
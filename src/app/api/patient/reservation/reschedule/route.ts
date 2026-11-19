import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {
    getClinicNotificationEmail,
    sendAdminRescheduleAlert,
    sendRescheduleRequestConfirmation
} from "@/utils/email-sender";
import {parseMagicToken} from "@/lib/request-security";


export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        const token = parseMagicToken(body?.token);

        if (!token) {
            return NextResponse.json({message: "Brak tokenu"}, {status: 400});
        }

        const reservation = await prisma.reservation.findUnique({
            where: {magicToken: token}
        });

        if (!reservation) {
            return NextResponse.json({message: "Nie znaleziono rezerwacji"}, {status: 404});
        }

        if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
            return NextResponse.json({message: "Nie można zmienić terminu tej rezerwacji"}, {status: 400});
        }

        // Only the first request flips the flag and sends e-mails — repeated calls are no-ops,
        // so the endpoint cannot be used to spam the patient or the clinic.
        const flagged = await prisma.reservation.updateMany({
            where: {id: reservation.id, rescheduleRequested: false},
            data: {rescheduleRequested: true}
        });

        if (flagged.count === 0) {
            return NextResponse.json({success: true, alreadyRequested: true}, {status: 200});
        }

        await sendRescheduleRequestConfirmation({
            email: reservation.email,
            patientName: reservation.patientName,
            date: reservation.date
        });

        await sendAdminRescheduleAlert({
            adminEmail: await getClinicNotificationEmail(),
            patientName: reservation.patientName,
            date: reservation.date
        });

        return NextResponse.json({success: true}, {status: 200});
    } catch  {
        return NextResponse.json({message: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}

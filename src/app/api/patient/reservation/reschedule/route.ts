import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {sendAdminRescheduleAlert, sendRescheduleRequestConfirmation} from "@/utils/email-sender";


export async function POST(req: Request) {
    try {
        const {token} = await req.json();

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
        await prisma.reservation.update({
            where: {id: reservation.id},
            data: {rescheduleRequested: true}
        });

        await sendRescheduleRequestConfirmation({
            email: reservation.email,
            patientName: reservation.patientName,
            date: reservation.date
        });
        const settings = await prisma.clinicSettings.findUnique({
            where: { id: "global" }
        });
        const adminEmail = settings?.email || "jakub.lawniczak753@gmail.com";

        await sendAdminRescheduleAlert({
            adminEmail: adminEmail,
            patientName: reservation.patientName,
            date: reservation.date
        });

        return NextResponse.json({success: true}, {status: 200});
    } catch  {
        return NextResponse.json({message: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}
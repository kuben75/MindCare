import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {sendRescheduleEmail} from "@/utils/email-sender";


export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const body = await req.json();
        const {date} = body;
        const resolvedParams = await params;

        if(!date) {
            return NextResponse.json({message: "Brak nowej daty"}, {status: 400});
        }
        const isReservationDateFree = await prisma.reservation.findFirst({
            where: {
                date: new Date(date),
                status: {
                    not: "CANCELLED"
                },
                id: {
                    not: resolvedParams.id
                }
            }
        });

        if(isReservationDateFree) {
            return NextResponse.json({message: "Wybrana data jest już zajęta"}, {status: 400});
        }

        const updatedReservation = await prisma.reservation.update({
            where: {id: resolvedParams.id},
            data: {
                date: new Date(date),
                rescheduleRequested: false
            },
            include: { service: true}
        });

        await sendRescheduleEmail({
            email: updatedReservation.email,
            patientName: updatedReservation.patientName,
            date: updatedReservation.date,
            serviceName: updatedReservation.service.name
        });

        return NextResponse.json({success: true, reservation: updatedReservation})
    }
    catch (e) {
        return NextResponse.json({message: "Wystąpił błąd serwera. Spróbuj ponownie później. " + e}, {status: 500});
    }
}
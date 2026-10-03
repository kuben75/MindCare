import prisma from "@/infrastructure/prisma";
import {sendPatientReminderEmail} from "@/utils/email-sender";
import {NextResponse} from "next/server";
import {getWarsawStartOfDay} from "@/utils/warsaw-time";


export async function GET(req:Request) {
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    try {
        const luxonTomorrow = getWarsawStartOfDay().plus({ days: 1 });
        const startOfTomorrow = luxonTomorrow.toJSDate();
        const endOfTomorrow = luxonTomorrow.endOf('day').toJSDate();

        const upcomingReservations = await prisma.reservation.findMany({
            where: {
                date: {
                    gte: startOfTomorrow,
                    lte: endOfTomorrow
                },
                status: {
                in: ["PAID", "PENDING"]
                }
            },
            include: {
                service: true
            }
        });

        for (const reservation of upcomingReservations) {
            await sendPatientReminderEmail({
                email: reservation.email,
                patientName: reservation.patientName,
                date: reservation.date,
                serviceName: reservation.service.name
            });
        }
        return NextResponse.json({success: true, count: upcomingReservations.length})
    }catch  {
        return NextResponse.json({message: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}
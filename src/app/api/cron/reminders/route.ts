import prisma from "@/infrastructure/prisma";
import {sendPatientReminderEmail} from "@/utils/email-sender";
import {NextResponse} from "next/server";


export async function GET(req:Request) {
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);

        const upcomingReservations = await prisma.reservation.findMany({
            where: {
                date: {
                    gte: tomorrow,
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
    }catch (e) {
        return NextResponse.json({message: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}
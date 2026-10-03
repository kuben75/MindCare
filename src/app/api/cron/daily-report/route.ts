import prisma from "@/infrastructure/prisma";
import {sendAdminDailyReportEmail} from "@/utils/email-sender";
import {NextResponse} from "next/server";
import {getWarsawStartOfDay} from "@/utils/warsaw-time";


export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    try{
        const luxonToday = getWarsawStartOfDay();
        const today = luxonToday.toJSDate();

        const endOfToday = luxonToday.endOf('day').toJSDate();

        const todayAppointments = await prisma.reservation.findMany({
            where: {
                date: {
                    gte: today,
                    lte: endOfToday
                },
                status: {
                    in: ["PAID", "PENDING"]
                }
            },
            orderBy: {
                date: 'asc'
            }
        });
        if(todayAppointments.length > 0) {
            const settings = await prisma.clinicSettings.findUnique({
                where: { id: "global" }
            });

            const adminEmail = settings?.email || "jakub.lawniczak753@gmail.com";

            await sendAdminDailyReportEmail({
                adminEmail: adminEmail,
                appointmentsCount: todayAppointments.length,
                firstAppointment: todayAppointments[0],
                date: today
            });
        }
        return NextResponse.json({success: true, count: todayAppointments.length})
    }catch  {
        return NextResponse.json({message: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}
import prisma from "@/infrastructure/prisma";
import {sendAdminDailyReportEmail} from "@/utils/email-sender";
import {NextResponse} from "next/server";


export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    try{
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

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
import prisma from "@/infrastructure/prisma";
import {getClinicNotificationEmail, sendAdminDailyReportEmail} from "@/utils/email-sender";
import {isAuthorizedCron} from "@/lib/request-security";
import {NextResponse} from "next/server";
import {getWarsawStartOfDay} from "@/utils/warsaw-time";


export async function GET(req: Request) {
    if (!isAuthorizedCron(req)) {
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
            const adminEmail = await getClinicNotificationEmail();

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
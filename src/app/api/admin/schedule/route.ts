import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {ISchedulePayload} from "@/types/reservation";

export async function PUT(req: Request) {
    try{
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        const body = await req.json();
        const {schedules} = body;

        if(!Array.isArray(schedules) || schedules.length !== 7) {
            return NextResponse.json({error: "Invalid schedules format"}, {status: 400});
        }

        await prisma.$transaction(
            schedules.map((schedule: ISchedulePayload) =>
            prisma.weeklySchedule.upsert({
                where: {dayOfWeek: schedule.dayOfWeek},
                update: {
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    isActive: schedule.isActive
                },
                create: {
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    isActive: schedule.isActive
                }
            }))
        );
        return NextResponse.json({ message: "Grafik zaktualizowany" }, { status: 200 });
    }catch (e) {
        console.error("Error updating schedule:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
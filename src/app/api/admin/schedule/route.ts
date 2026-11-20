import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {firstIssue, scheduleSchema} from "@/schemas/admin";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PUT(req: Request) {
    try{
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }
        const body = await req.json().catch(() => null);
        const validation = scheduleSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({error: firstIssue(validation.error)}, {status: 400});
        }
        const {schedules} = validation.data;

        await prisma.$transaction(
            schedules.map((schedule) =>
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
    }catch  {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
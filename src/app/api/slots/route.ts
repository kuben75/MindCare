import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {getDateKey} from "@/utils/calendar-utils";

export async function GET(req: Request) {
    try{
        const {searchParams} = new URL(req.url);
        const startDateParam = searchParams.get('startDate');
        if(!startDateParam) {
            return NextResponse.json({error: 'Brak daty startowej'}, {status: 400});
        }
        const startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 30);
        endDate.setHours(23, 59, 59, 999);

        const reservations = await prisma.reservation.findMany({
            where: {
                date: {gte: startDate, lte: endDate},
                status: {not: 'CANCELLED'}
            }
        });

        const bookedSlots = new Set(
            reservations.map(res => {
                const dateKey = getDateKey(res.date);
                const time = res.date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                return `${dateKey}-${time}`;
            })
        );

        const blockedTimes = await prisma.blockedTime.findMany({
            where: {
                endDate: {gte: startDate},
                startDate: {lte: endDate}
            }
        });

        const dbSchedules = await prisma.weeklySchedule.findMany();

        const fallbackSchedules = [
            { dayOfWeek: 1, startTime: "17:00", endTime: "20:00", isActive: true },
            { dayOfWeek: 2, startTime: "17:00", endTime: "20:00", isActive: true },
            { dayOfWeek: 3, startTime: "17:00", endTime: "20:00", isActive: true },
            { dayOfWeek: 4, startTime: "17:00", endTime: "20:00", isActive: true },
            { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isActive: true },
            { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isActive: true },
            { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isActive: false }
        ];

        const schedulesToUse = dbSchedules.length > 0 ? dbSchedules : fallbackSchedules;

        const scheduleMap = new Map(schedulesToUse.map(s => [s.dayOfWeek, s]));

        const days = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const isToday = currentDate.getTime() === today.getTime();
            const dateKey = getDateKey(currentDate);
            const dayOfWeek = currentDate.getDay();

            const slots = [];
            const dayConfig = scheduleMap.get(dayOfWeek);

            if (dayConfig && dayConfig.isActive) {
                const startHour = parseInt(dayConfig.startTime.split(':')[0]);
                const endHour = parseInt(dayConfig.endTime.split(':')[0]);

                for (let h = startHour; h < endHour; h++) {
                    const timeString = `${String(h).padStart(2, '0')}:00`;
                    const slotKey = `${dateKey}-${timeString}`;

                    const slotStartDate = new Date(currentDate);
                    slotStartDate.setHours(h, 0, 0, 0);

                    const slotEndDate = new Date(currentDate);
                    slotEndDate.setHours(h + 1, 0, 0, 0);

                    const isPast = slotStartDate < new Date();

                    const isBlocked = blockedTimes.some(block => {
                        return block.startDate < slotEndDate && block.endDate > slotStartDate;
                    });

                    const isBooked = bookedSlots.has(slotKey);

                    slots.push({
                        id: slotKey,
                        time: timeString,
                        available: !isPast && !isBlocked && !isBooked,
                        type: "online"
                    });
                }
            }
            days.push({
                date: currentDate.toISOString(),
                slots: slots,
                isToday: isToday
            });
        }

        return NextResponse.json({ days }, { status: 200 });
    }catch (e) {
        console.error(e);
        return NextResponse.json({error: 'Nie można pobrać dostępnych slotów'}, {status: 500});
    }
}

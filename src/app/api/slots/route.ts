import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {getDateKey} from "@/utils/calendar-utils";
import {getWarsawStartOfDay, getWarsawNow} from "@/utils/warsaw-time"; // <-- IMPORTY
import {DateTime} from "luxon";

export async function GET(req: Request) {
    try{
        const {searchParams} = new URL(req.url);
        const startDateParam = searchParams.get('startDate');

        if(!startDateParam) {
            return NextResponse.json({error: 'Brak daty startowej'}, {status: 400});
        }

        // 1. Definiujemy "dzisiaj" i "teraz" w PL, wykluczając czas Vercela (UTC)
        const warsawNow = getWarsawNow();
        const startOfDay = getWarsawStartOfDay(startDateParam);

        // 2. Dodajemy 30 dni w przyszłość
        const endOfDayLimit = startOfDay.plus({days: 30}).endOf('day');

        // Baza potrzebuje czystych obiektów JS Date
        const jsStartDate = startOfDay.toJSDate();
        const jsEndDate = endOfDayLimit.toJSDate();

        const reservations = await prisma.reservation.findMany({
            where: {
                date: {gte: jsStartDate, lte: jsEndDate},
                status: {not: 'CANCELLED'}
            }
        });

        // Tworzymy unikalne klucze w strefie PL (np. "2026-09-24-17:00")
        const bookedSlots = new Set(
            reservations.map(res => {
                const dateKey = getDateKey(res.date);
                // Wyrzucamy toLocaleTimeString (który brał strefę Vercela) i używamy Luxona:
                const time = DateTime.fromJSDate(res.date).setZone('Europe/Warsaw').toFormat('HH:mm');
                return `${dateKey}-${time}`;
            })
        );

        const blockedTimes = await prisma.blockedTime.findMany({
            where: {
                endDate: {gte: jsStartDate},
                startDate: {lte: jsEndDate}
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
        const todayKey = getDateKey(warsawNow.toJSDate());

        for (let i = 0; i < 30; i++) {
            const currentDay = startOfDay.plus({days: i});
            const dateKey = currentDay.toFormat('yyyy-MM-dd');
            const isToday = dateKey === todayKey;

            const dayOfWeek = currentDay.weekday === 7 ? 0 : currentDay.weekday;

            const slots = [];
            const dayConfig = scheduleMap.get(dayOfWeek);

            if (dayConfig && dayConfig.isActive) {
                const startHour = parseInt(dayConfig.startTime.split(':')[0]);
                const endHour = parseInt(dayConfig.endTime.split(':')[0]);

                for (let h = startHour; h < endHour; h++) {
                    const timeString = `${String(h).padStart(2, '0')}:00`;
                    const slotKey = `${dateKey}-${timeString}`;

                    const slotStart = currentDay.set({hour: h, minute: 0, second: 0, millisecond: 0});
                    const slotEnd = slotStart.plus({hours: 1});

                    const isPast = slotStart < warsawNow;

                    const isBlocked = blockedTimes.some(block => {
                        return block.startDate < slotEnd.toJSDate() && block.endDate > slotStart.toJSDate();
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
                date: currentDay.toJSDate().toISOString(),
                slots: slots,
                isToday: isToday
            });
        }

        return NextResponse.json({ days }, { status: 200 });
    }catch  {
        return NextResponse.json({error: 'Nie można pobrać dostępnych slotów'}, {status: 500});
    }
}
import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DateTime } from "luxon";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const todayWarsaw = DateTime.now().setZone("Europe/Warsaw").startOf("day").toJSDate();

        const blockedTimes = await prisma.blockedTime.findMany({
            where: {
                endDate: { gte: todayWarsaw }
            },
            orderBy: { startDate: "asc" }
        });

        return NextResponse.json(blockedTimes);
    } catch (error) {
        console.error("Błąd pobierania blokad:", error);
        return NextResponse.json({ error: "Nie udało się pobrać blokad" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { date, startTime, endTime, reason, isFullDay } = body;

        if (!date) {
            return NextResponse.json({ error: "Data jest wymagana" }, { status: 400 });
        }

        let startDateTime: Date;
        let endDateTime: Date;

        if (isFullDay) {
            startDateTime = DateTime.fromISO(date, { zone: "Europe/Warsaw" }).startOf("day").toJSDate();
            endDateTime = DateTime.fromISO(date, { zone: "Europe/Warsaw" }).endOf("day").toJSDate();
        } else {
            if (!startTime || !endTime) {
                return NextResponse.json({ error: "Podaj godzinę rozpoczęcia i zakończenia" }, { status: 400 });
            }

            const parsedStart = DateTime.fromISO(`${date}T${startTime}`, { zone: "Europe/Warsaw" });
            const parsedEnd = DateTime.fromISO(`${date}T${endTime}`, { zone: "Europe/Warsaw" });

            if (!parsedStart.isValid || !parsedEnd.isValid) {
                return NextResponse.json({ error: "Nieprawidłowy format daty lub godziny" }, { status: 400 });
            }

            if (parsedEnd <= parsedStart) {
                return NextResponse.json({ error: "Godzina zakończenia musi być późniejsza niż rozpoczęcia" }, { status: 400 });
            }

            startDateTime = parsedStart.toJSDate();
            endDateTime = parsedEnd.toJSDate();
        }

        const blocked = await prisma.blockedTime.create({
            data: {
                startDate: startDateTime,
                endDate: endDateTime,
                reason: reason?.trim() || null,
                isFullDay: Boolean(isFullDay)
            }
        });

        await prisma.systemLog.create({
            data: {
                action: "DODANIE_BLOKADY",
                details: `Admin ${session.user.email} zablokował termin: ${startDateTime.toISOString()} - ${endDateTime.toISOString()} (${reason || 'brak powodu'})`
            }
        });

        return NextResponse.json(blocked, { status: 201 });
    } catch (error) {
        console.error("Błąd tworzenia blokady terminu:", error);
        return NextResponse.json({ error: "Wystąpił błąd podczas blokowania terminu" }, { status: 500 });
    }
}
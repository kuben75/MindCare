import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const blockedTimes = await prisma.blockedTime.findMany({
            where: { endDate: { gte: today } },
            orderBy: { startDate: 'asc' }
        });

        return NextResponse.json(blockedTimes, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });

        const body = await req.json();
        const { date, startTime, endTime, reason } = body;

        if (!date || !startTime || !endTime) {
            return NextResponse.json({ error: "Data i godziny są wymagane" }, { status: 400 });
        }

        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);

        const isBlockExists = await prisma.blockedTime.findFirst({
            where: {
                startDate: { lt: endDateTime },
                endDate: { gt: startDateTime }
            }
        });

        if (isBlockExists) {
            return NextResponse.json({ error: "Istnieje już blokada pokrywająca ten czas" }, { status: 409 });
        }

        const newBlock = await prisma.blockedTime.create({
            data: {
                startDate: startDateTime,
                endDate: endDateTime,
                reason: reason || "",
                isFullDay: false
            }
        });

        return NextResponse.json(newBlock, { status: 201 });
    } catch (e) {
        console.error("Błąd zapisu okienka:", e);
        return NextResponse.json({ error: "Wystąpił błąd zapisu" }, { status: 500 });
    }
}
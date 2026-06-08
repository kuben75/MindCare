import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) return NextResponse.json({ message: "Brak tokenu" }, { status: 400 });

        const reservation = await prisma.reservation.findUnique({
            where: { magicToken: token }
        });

        if (!reservation || reservation.status !== 'PENDING') {
            return NextResponse.json({ message: "Nie można anulować tej rezerwacji" }, { status: 400 });
        }

        await prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: 'CANCELLED' }
        });

        await prisma.systemLog.create({
            data: {
                action: "PORZUCENIE_KOSZYKA",
                details: `Zwolniono termin. Rezerwacja: ${reservation.id} | Email: ${reservation.email}`
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch  {
        return NextResponse.json({ message: "Wystąpił błąd serwera." }, { status: 500 });
    }
}
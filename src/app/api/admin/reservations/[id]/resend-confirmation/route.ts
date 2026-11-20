import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendMagicLinkEmail } from "@/utils/email-sender";

/** Re-sends the patient e-mail for the current status (payment request or confirmation). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const reservation = await prisma.reservation.findUnique({ where: { id }, include: { service: true } });
        if (!reservation) {
            return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
        }
        if (reservation.status !== "PENDING" && reservation.status !== "PAID") {
            return NextResponse.json({ error: "E-mail można wysłać ponownie tylko dla wizyty oczekującej lub opłaconej." }, { status: 400 });
        }

        const sent = await sendMagicLinkEmail({
            email: reservation.email,
            patientName: reservation.patientName,
            date: reservation.date,
            serviceName: reservation.service.name,
            magicToken: reservation.magicToken,
            status: reservation.status,
            price: reservation.amountPaid ?? reservation.service.price,
        });

        if (!sent) {
            return NextResponse.json({ error: "Nie udało się wysłać e-maila. Sprawdź logi systemowe." }, { status: 502 });
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
    }
}

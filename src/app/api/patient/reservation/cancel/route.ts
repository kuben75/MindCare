import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { parseMagicToken } from "@/lib/request-security";
import { sendCancellationEmail } from "@/utils/email-sender";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        const token = parseMagicToken(body?.token);

        if (!token) {
            return NextResponse.json({ message: "Token jest wymagany" }, { status: 400 });
        }

        const reservation = await prisma.reservation.findUnique({
            where: { magicToken: token },
            include: { service: true }
        });

        if (!reservation) {
            return NextResponse.json({ message: "Nie znaleziono rezerwacji" }, { status: 404 });
        }

        if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
            return NextResponse.json({ message: "Nie można anulować tej rezerwacji" }, { status: 400 });
        }

        const now = new Date();
        const reservationDate = new Date(reservation.date);
        const timeDiff = reservationDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        const isEligibleForRefund = hoursDiff >= 24;
        let cancellationReason = "Odwołano przez pacjenta";

        if (reservation.status === 'PENDING') {
            cancellationReason = "Odwołano rezerwację wstępną przez pacjenta.";
            await prisma.systemLog.create({
                data: {
                    action: "ANULOWANIE_REZERWACJI_WSTĘPNEJ",
                    details: `Pacjent odwołał nieopłaconą rezerwację: ${reservation.id} (${reservation.patientName})`
                }
            });
        }

        if (reservation.status === 'PAID') {
            if (!isEligibleForRefund) {
                cancellationReason = "Odwołano przez pacjenta na mniej niż 24h przed terminem. Zgodnie z regulaminem opłata nie podlega zwrotowi.";
                await prisma.systemLog.create({
                    data: {
                        action: "ANULOWANIE_BEZ_ZWROTU",
                        details: `Pacjent odwołał rezerwację ${reservation.id} poniżej 24h (${hoursDiff.toFixed(1)}h). Środki zatrzymane.`
                    }
                });
            } else {
                cancellationReason = "Odwołano przez pacjenta z prawem do zwrotu (ponad 24h przed terminem). Gabinet skontaktuje się z Tobą w sprawie zwrotu opłaty.";
                await prisma.systemLog.create({
                    data: {
                        action: "WYMAGANY_ZWROT_RĘCZNY",
                        details: `Pacjent odwołał opłaconą rezerwację ${reservation.id} (${reservation.patientName}, ${reservation.email}) ponad 24h przed terminem. Wymagany ręczny zwrot ${reservation.service.price} zł.`
                    }
                });
            }
        }

        const canceledRes = await prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: 'CANCELLED' },
            include: { service: true }
        });

        try {
            await sendCancellationEmail({
                email: canceledRes.email,
                patientName: canceledRes.patientName,
                date: canceledRes.date,
                serviceName: canceledRes.service.name,
                reason: cancellationReason
            });
        } catch (mailError) {
            console.error("Błąd wysyłki e-maila o anulowaniu:", mailError);
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Błąd podczas anulowania rezerwacji:", error);
        return NextResponse.json({ message: "Wystąpił błąd serwera. Spróbuj ponownie później." }, { status: 500 });
    }
}
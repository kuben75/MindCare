import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { parseMagicToken } from "@/lib/request-security";
import { getClinicNotificationEmail, sendAdminCancellationAlert, sendCancellationEmail } from "@/utils/email-sender";

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
        const hoursDiff = (reservation.date.getTime() - now.getTime()) / (1000 * 60 * 60);

        // A visit that already started can't be cancelled from the patient link (it would drop out
        // of the clinic's revenue and CANCELLED can't be undone).
        if (hoursDiff <= 0) {
            return NextResponse.json({ message: "Ta wizyta już się odbyła lub właśnie trwa — nie można jej odwołać. Skontaktuj się z gabinetem." }, { status: 400 });
        }

        const amount = reservation.amountPaid ?? reservation.service.price;
        const refundDue = reservation.status === 'PAID' && hoursDiff >= 24;

        // Conditional on the status we read → if the clinic changed it in the meantime, we stop.
        const result = await prisma.reservation.updateMany({
            where: { id: reservation.id, status: reservation.status },
            data: { status: 'CANCELLED' },
        });
        if (result.count === 0) {
            return NextResponse.json({ message: "Status wizyty zmienił się w międzyczasie. Odśwież stronę i spróbuj ponownie." }, { status: 409 });
        }

        let cancellationReason: string;
        if (reservation.status === 'PENDING') {
            cancellationReason = "Odwołano rezerwację wstępną przez pacjenta.";
            await prisma.systemLog.create({
                data: {
                    action: "ANULOWANIE_REZERWACJI_WSTĘPNEJ",
                    details: `Pacjent odwołał nieopłaconą rezerwację: ${reservation.id} (${reservation.patientName})`
                }
            });
        } else if (!refundDue) {
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
                    details: `Pacjent odwołał opłaconą rezerwację ${reservation.id} (${reservation.patientName}, ${reservation.email}) ponad 24h przed terminem. Wymagany ręczny zwrot ${amount} zł.`
                }
            });
        }

        await Promise.allSettled([
            sendCancellationEmail({
                email: reservation.email,
                patientName: reservation.patientName,
                date: reservation.date,
                serviceName: reservation.service.name,
                reason: cancellationReason
            }),
            getClinicNotificationEmail().then((adminEmail) => sendAdminCancellationAlert({
                adminEmail,
                patientName: reservation.patientName,
                patientEmail: reservation.email,
                date: reservation.date,
                serviceName: reservation.service.name,
                refundDue,
                amount,
            })),
        ]);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Błąd podczas anulowania rezerwacji:", error);
        return NextResponse.json({ message: "Wystąpił błąd serwera. Spróbuj ponownie później." }, { status: 500 });
    }
}

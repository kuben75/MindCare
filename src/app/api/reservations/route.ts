import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { reservationSchema } from "@/schemas/reservation";
import { isSlotAvailable } from "@/services/availability.service";
import { sendMagicLinkEmail, sendNewReservationAdminAlert, getAdminNotificationEmail } from "@/utils/email-sender";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = reservationSchema.safeParse(body);

        if (!validation.success) {
            const firstErrorMessage = validation.error.issues[0]?.message || "Nieprawidłowe dane formularza";
            return NextResponse.json({ error: firstErrorMessage }, { status: 400 });
        }

        const { patientName, email, phone, serviceId, date, termsAccepted } = validation.data;

        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service || !service.isActive) {
            return NextResponse.json({ error: "Wybrana usługa jest obecnie niedostępna." }, { status: 400 });
        }

        const isFree = await isSlotAvailable(date, service.duration);
        if (!isFree) {
            return NextResponse.json(
                { error: "Przepraszamy, ten termin został właśnie zajęty lub koliduje z inną wizytą. Wybierz inną godzinę." },
                { status: 409 }
            );
        }

        const clinicSettings = await prisma.clinicSettings.findFirst();

        const newReservation = await prisma.reservation.create({
            data: {
                patientName: patientName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                date: date,
                serviceId,
                status: "PENDING",
                isManual: false,
                hasAcceptedTerms: termsAccepted,
                amountPaid: service.price,
                currency: "PLN"
            },
            include: {
                service: true
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        try {
            await sendMagicLinkEmail({
                email: newReservation.email,
                patientName: newReservation.patientName,
                serviceName: newReservation.service.name,
                date: newReservation.date,
                magicToken: newReservation.magicToken,
                bankAccount: clinicSettings?.bankAccount || "Zostanie przesłany w kolejnej wiadomości",
                price: newReservation.service.price
            });

            const adminEmail = await getAdminNotificationEmail();
            await sendNewReservationAdminAlert({
                adminEmail,
                patientName: newReservation.patientName,
                patientEmail: newReservation.email,
                patientPhone: newReservation.phone,
                serviceName: newReservation.service.name,
                date: newReservation.date,
                status: "PENDING"
            });
        } catch (emailError) {
            console.error("Błąd wysyłki e-mail po rezerwacji:", emailError);
        }

        await prisma.systemLog.create({
            data: {
                action: "REZERWACJA_WSTĘPNA",
                details: `Utworzono rezerwację wstępną: ${newReservation.id} | Pacjent: ${newReservation.patientName} (${newReservation.email}) | Usługa: ${newReservation.service.name}`,
            }
        });

        return NextResponse.json({
            url: `${baseUrl}/reservation/success?token=${newReservation.magicToken}`
        }, { status: 201 });

    } catch (error) {
        console.error("Błąd podczas tworzenia rezerwacji:", error);
        return NextResponse.json({ error: "Wystąpił błąd podczas tworzenia rezerwacji" }, { status: 500 });
    }
}
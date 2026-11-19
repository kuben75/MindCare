import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/prisma";
import { reservationSchema } from "@/schemas/reservation";
import { isSlotAvailable } from "@/services/availability.service";
import { checkReservationRateLimit } from "@/lib/rate-limit";
import { getClientIp, verifyTurnstile } from "@/lib/request-security";
import {
    sendMagicLinkEmail,
    sendNewReservationAdminAlert,
    getAdminNotificationEmail,
} from "@/utils/email-sender";

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req.headers);

        const rateLimit = await checkReservationRateLimit(clientIp);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Zbyt wiele prób rezerwacji. Spróbuj ponownie za godzinę." },
                { status: 429 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const validation = reservationSchema.safeParse(body);

        if (!validation.success) {
            const firstErrorMessage = validation.error.issues[0]?.message || "Nieprawidłowe dane formularza";
            return NextResponse.json({ error: firstErrorMessage }, { status: 400 });
        }

        const { patientName, email, phone, serviceId, date, termsAccepted } = validation.data;

        if (!(await verifyTurnstile((body as { turnstileToken?: unknown })?.turnstileToken, clientIp))) {
            return NextResponse.json(
                { error: "Weryfikacja antyspamowa nie powiodła się. Odśwież stronę i spróbuj ponownie." },
                { status: 400 }
            );
        }

        if (!termsAccepted) {
            return NextResponse.json(
                { error: "Wymagana jest akceptacja regulaminu i polityki prywatności." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service || !service.isActive) {
            return NextResponse.json({ error: "Wybrana usługa jest obecnie niedostępna." }, { status: 400 });
        }

        const newReservation = await prisma.$transaction(
            async (tx) => {
                const activePendingCount = await tx.reservation.count({
                    where: {
                        email: normalizedEmail,
                        status: "PENDING",
                    },
                });

                if (activePendingCount >= 2) {
                    throw new Error("TOO_MANY_PENDING");
                }

                const isFree = await isSlotAvailable(date, service.duration, tx);
                if (!isFree) {
                    throw new Error("SLOT_UNAVAILABLE");
                }

                return tx.reservation.create({
                    data: {
                        patientName: patientName.trim(),
                        email: normalizedEmail,
                        phone: phone.trim(),
                        date,
                        serviceId,
                        status: "PENDING",
                        isManual: false,
                        hasAcceptedTerms: true,
                        amountPaid: service.price,
                        currency: "PLN",
                    },
                    include: {
                        service: true,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            }
        );

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        try {
            await sendMagicLinkEmail({
                email: newReservation.email,
                patientName: newReservation.patientName,
                serviceName: newReservation.service.name,
                date: newReservation.date,
                magicToken: newReservation.magicToken,
                status: "PENDING",
                price: newReservation.service.price,
            });

            const adminEmail = await getAdminNotificationEmail();
            await sendNewReservationAdminAlert({
                adminEmail,
                patientName: newReservation.patientName,
                patientEmail: newReservation.email,
                patientPhone: newReservation.phone,
                serviceName: newReservation.service.name,
                date: newReservation.date,
                status: "PENDING",
            });
        } catch (emailError) {
            console.error("Błąd wysyłki e-mail po rezerwacji:", emailError);
        }

        await prisma.systemLog.create({
            data: {
                action: "REZERWACJA_WSTĘPNA",
                details: `Utworzono rezerwację wstępną: ${newReservation.id} | Pacjent: ${newReservation.patientName} (${newReservation.email}) | Usługa: ${newReservation.service.name}`,
                ipAddress: clientIp,
            },
        });

        return NextResponse.json(
            {
                url: `${baseUrl}/reservation/success?token=${newReservation.magicToken}`,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "TOO_MANY_PENDING") {
                return NextResponse.json(
                    { error: "Masz już nieopłacone rezerwacje. Skontaktuj się z gabinetem w sprawie płatności lub poczekaj na ich rozliczenie." },
                    { status: 429 }
                );
            }
            if (error.message === "SLOT_UNAVAILABLE") {
                return NextResponse.json(
                    { error: "Przepraszamy, ten termin jest niedostępny lub został właśnie zajęty." },
                    { status: 409 }
                );
            }
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: string }).code === "P2034"
        ) {
            return NextResponse.json(
                { error: "Przepraszamy, ten termin został właśnie zajęty przez inną osobę." },
                { status: 409 }
            );
        }

        console.error("Błąd podczas tworzenia rezerwacji:", error);
        return NextResponse.json({ error: "Wystąpił błąd podczas tworzenia rezerwacji" }, { status: 500 });
    }
}
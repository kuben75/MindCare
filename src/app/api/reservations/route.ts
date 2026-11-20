import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/prisma";
import { reservationSchema } from "@/schemas/reservation";
import { checkSlot, SLOT_CHECK_MESSAGES, type SlotCheckReason } from "@/services/availability.service";
import { checkReservationRateLimit, RESERVATION_LOG_ACTION } from "@/lib/rate-limit";
import { getClientIp, verifyTurnstile } from "@/lib/request-security";
import { PENDING_HOLD_MS } from "@/constants/reservations";
import {
    sendMagicLinkEmail,
    sendNewReservationAdminAlert,
    getAdminNotificationEmail,
} from "@/utils/email-sender";

class BookingError extends Error {
    constructor(public code: "RATE_LIMIT" | "TOO_MANY_PENDING" | SlotCheckReason) {
        super(code);
    }
}

const RATE_LIMIT_MESSAGE = "Zbyt wiele prób rezerwacji. Spróbuj ponownie za godzinę.";

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req.headers);

        // Cheap early exit; the authoritative check runs inside the transaction below.
        const rateLimit = await checkReservationRateLimit(clientIp);
        if (!rateLimit.success) {
            return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
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
                // Count + log row in the same Serializable transaction → parallel requests cannot
                // all pass the limit (Postgres aborts the conflicting ones with P2034).
                const limit = await checkReservationRateLimit(clientIp, tx);
                if (!limit.success) throw new BookingError("RATE_LIMIT");

                const activePendingCount = await tx.reservation.count({
                    where: {
                        email: normalizedEmail,
                        status: "PENDING",
                        createdAt: { gte: new Date(Date.now() - PENDING_HOLD_MS) },
                    },
                });
                if (activePendingCount >= 2) throw new BookingError("TOO_MANY_PENDING");

                const slot = await checkSlot(date, service.duration, tx, { mode: "public" });
                if (!slot.ok) throw new BookingError(slot.reason);

                const created = await tx.reservation.create({
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

                await tx.systemLog.create({
                    data: {
                        action: RESERVATION_LOG_ACTION,
                        details: `Utworzono rezerwację wstępną: ${created.id} | Pacjent: ${created.patientName} (${created.email}) | Usługa: ${created.service.name}`,
                        ipAddress: clientIp,
                    },
                });

                return created;
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

        return NextResponse.json(
            {
                url: `${baseUrl}/reservation/success?token=${newReservation.magicToken}`,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof BookingError) {
            if (error.code === "RATE_LIMIT") {
                return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
            }
            if (error.code === "TOO_MANY_PENDING") {
                return NextResponse.json(
                    { error: "Masz już nieopłacone rezerwacje. Skontaktuj się z gabinetem w sprawie płatności lub poczekaj na ich rozliczenie." },
                    { status: 429 }
                );
            }
            const message = error.code === "BUSY"
                ? "Przepraszamy, ten termin jest niedostępny lub został właśnie zajęty."
                : SLOT_CHECK_MESSAGES[error.code];
            return NextResponse.json({ error: message }, { status: 409 });
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: string }).code === "P2034"
        ) {
            return NextResponse.json(
                { error: "Ten termin został właśnie zajęty lub system jest chwilowo obciążony. Odśwież kalendarz i spróbuj ponownie." },
                { status: 409 }
            );
        }

        console.error("Błąd podczas tworzenia rezerwacji:", error);
        return NextResponse.json({ error: "Wystąpił błąd podczas tworzenia rezerwacji" }, { status: 500 });
    }
}

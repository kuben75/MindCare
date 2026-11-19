import {whitelistSchema} from "@/schemas/waitlist";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {checkWaitlistRateLimit, WAITLIST_LOG_ACTION} from "@/lib/rate-limit";
import {getClientIp, verifyTurnstile} from "@/lib/request-security";

// Identical response whether or not the person was already on the list, so the endpoint
// cannot be used to check if someone is waiting for a given (health-related) service.
const ACCEPTED = () =>
    NextResponse.json({success: true, message: "Zapisano na listę oczekujących."}, {status: 201});

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req.headers);

        const rateLimit = await checkWaitlistRateLimit(clientIp);
        if (!rateLimit.success) {
            return NextResponse.json({error: "Zbyt wiele zgłoszeń. Spróbuj ponownie za godzinę."}, {status: 429});
        }

        const body = await req.json().catch(() => null);

        const validation = whitelistSchema.safeParse(body);
        if(!validation.success) {
            const firstMessageError = validation.error.issues[0]?.message || "Nieprawidłowe dane formularza";
            return NextResponse.json({error: firstMessageError}, {status: 400});
        }
        const {patientName, email, phone, serviceId, notes, turnstileToken} = validation.data;

        if (!(await verifyTurnstile(turnstileToken, clientIp))) {
            return NextResponse.json(
                {error: "Weryfikacja antyspamowa nie powiodła się. Odśwież stronę i spróbuj ponownie."},
                {status: 400}
            );
        }

        const service = await prisma.service.findUnique({where: {id: serviceId}, select: {isActive: true}});
        if (!service || !service.isActive) {
            return NextResponse.json({error: "Wybrana usługa jest obecnie niedostępna."}, {status: 400});
        }

        await prisma.systemLog.create({
            data: {action: WAITLIST_LOG_ACTION, details: `Zgłoszenie na listę oczekujących (usługa ${serviceId})`, ipAddress: clientIp}
        });

        const existingEntry = await prisma.waitlist.findFirst({
            where: {email, serviceId},
            select: {id: true}
        });

        if (!existingEntry) {
            await prisma.waitlist.create({
                data: {
                    patientName,
                    email,
                    phone,
                    serviceId,
                    notes: notes || null
                }
            });
        }

        return ACCEPTED();
    }catch {
        return NextResponse.json({error: "Wystąpił błąd podczas dodawania do listy oczekujących"}, {status: 500});
    }
}

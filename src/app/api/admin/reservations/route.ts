import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/prisma";
import { checkSlot, SLOT_CHECK_MESSAGES, type SlotCheckReason } from "@/services/availability.service";
import { z } from "zod";
import {requireAdmin} from "@/lib/requireAdmin";

const adminReservationSchema = z.object({
    patientName: z.string().trim().min(2, "Imię i nazwisko jest wymagane").max(100, "Imię i nazwisko jest za długie"),
    email: z.string().trim().toLowerCase().max(254).pipe(z.email("Nieprawidłowy format adresu email")),
    phone: z.string().trim().min(7, "Numer telefonu jest wymagany").max(20, "Numer telefonu jest za długi"),
    serviceId: z.string().min(1, "Wybierz usługę").max(64),
    date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Nieprawidłowa data wizyty"),
    // A brand-new visit can only start as unpaid or paid.
    status: z.enum(["PENDING", "PAID"]).optional().default("PENDING"),
    notes: z.string().max(5000, "Notatka jest za długa").optional().nullable(),
});

class SlotError extends Error {
    constructor(public reason: SlotCheckReason) {
        super(reason);
    }
}

export async function POST(req: Request) {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        const validation = adminReservationSchema.safeParse(body);

        if (!validation.success) {
            const firstErrorMessage = validation.error.issues[0]?.message || "Nieprawidłowe dane formularza";
            return NextResponse.json({ error: firstErrorMessage }, { status: 400 });
        }

        const { patientName, email, phone, serviceId, date, status, notes } = validation.data;

        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return NextResponse.json({ error: "Wybrana usługa nie istnieje." }, { status: 400 });
        }

        const newReservation = await prisma.$transaction(async (tx) => {
            // Admin mode: any time not in the past, only required not to overlap visits/blocked time.
            const slot = await checkSlot(date, service.duration, tx, { mode: "admin" });
            if (!slot.ok) throw new SlotError(slot.reason);

            return tx.reservation.create({
                data: {
                    patientName,
                    email,
                    phone,
                    date: new Date(date),
                    serviceId,
                    status,
                    privateNotes: notes ? notes.trim() : null,
                    hasAcceptedTerms: true,
                    isManual: true,
                    amountPaid: service.price,
                    currency: "PLN"
                },
                include: {
                    service: true
                }
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        await prisma.systemLog.create({
            data: {
                action: "ADMIN_DODANIE_WIZYTY",
                details: `Admin ręcznie dodał wizytę: ${newReservation.id} dla ${newReservation.patientName} (${newReservation.service.name}) ze statusem ${newReservation.status}`,
            }
        });

        return NextResponse.json(newReservation, { status: 201 });

    } catch (error) {
        if (error instanceof SlotError) {
            return NextResponse.json({ error: SLOT_CHECK_MESSAGES[error.reason] }, { status: 409 });
        }
        if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2034") {
            return NextResponse.json({ error: "Kalendarz był właśnie zmieniany. Spróbuj ponownie." }, { status: 409 });
        }
        console.error("Błąd podczas ręcznego tworzenia rezerwacji przez admina:", error);
        return NextResponse.json({ error: "Wystąpił błąd podczas dodawania rezerwacji" }, { status: 500 });
    }
}

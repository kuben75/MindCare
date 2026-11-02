import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isSlotAvailable } from "@/services/availability.service";
import { z } from "zod";

const adminReservationSchema = z.object({
    patientName: z.string().min(2, "Imię i nazwisko jest wymagane"),
    email: z.string().email("Nieprawidłowy format adresu email"),
    phone: z.string().min(7, "Numer telefonu jest wymagany"),
    serviceId: z.string().min(1, "Wybierz usługę"),
    date: z.string().or(z.date()),
    status: z.enum(["PENDING", "PAID", "CANCELLED", "COMPLETED"]).optional().default("PENDING"),
    notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const body = await req.json();
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

        const isFree = await isSlotAvailable(date, service.duration);
        if (!isFree) {
            return NextResponse.json(
                { error: "Ten termin nakłada się na inną zaplanowaną wizytę w kalendarzu." },
                { status: 409 }
            );
        }

        const newReservation = await prisma.reservation.create({
            data: {
                patientName: patientName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                date: new Date(date),
                serviceId,
                status: status || "PENDING",
                privateNotes: notes ? notes.trim() : null,
                hasAcceptedTerms: true,
            },
            include: {
                service: true
            }
        });

        await prisma.systemLog.create({
            data: {
                action: "ADMIN_DODANIE_WIZYTY",
                details: `Admin ${session.user.email} ręcznie dodał wizytę: ${newReservation.id} dla ${newReservation.patientName} (${newReservation.service.name}) ze statusem ${newReservation.status}`,
            }
        });

        return NextResponse.json(newReservation, { status: 201 });

    } catch (error) {
        console.error("Błąd podczas ręcznego tworzenia rezerwacji przez admina:", error);
        return NextResponse.json({ error: "Wystąpił błąd podczas dodawania rezerwacji" }, { status: 500 });
    }
}
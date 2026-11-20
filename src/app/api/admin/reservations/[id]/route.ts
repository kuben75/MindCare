import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/prisma";
import { sendCancellationEmail, sendMagicLinkEmail } from "@/utils/email-sender";
import { requireAdmin } from "@/lib/requireAdmin";
import { STATUS_LABELS, canTransition } from "@/constants/reservations";
import { checkSlot, isHoldExpired } from "@/services/availability.service";

const VALID_STATUSES = ["PENDING", "PAID", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof VALID_STATUSES)[number];

class StatusError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json().catch(() => null);
        const status = body?.status as Status;

        if (!VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 });
        }

        const { current, updated } = await prisma.$transaction(async (tx) => {
            const current = await tx.reservation.findUnique({ where: { id }, include: { service: true } });
            if (!current) throw new StatusError(404, 'Nie znaleziono rezerwacji');

            if (!canTransition(current.status, status)) {
                const hint = current.status === 'PAID' && status === 'PENDING'
                    ? ' Jeśli płatność została zwrócona, anuluj wizytę.'
                    : current.status === 'PENDING' && status === 'COMPLETED'
                        ? ' Najpierw oznacz wizytę jako opłaconą.'
                        : '';
                throw new StatusError(400, `Nie można zmienić statusu z „${STATUS_LABELS[current.status]}” na „${STATUS_LABELS[status]}”.${hint}`);
            }

            // An unpaid online booking past its 72h hold no longer blocks its slot, so someone else
            // may have booked the same time. Re-check before confirming it.
            if (status === 'PAID' && isHoldExpired(current)) {
                const slot = await checkSlot(current.date, current.service.duration, tx, { mode: 'admin', excludeReservationId: current.id });
                if (!slot.ok && slot.reason === 'BUSY') {
                    throw new StatusError(409, 'Ta rezerwacja przekroczyła 72h na płatność i jej termin został w międzyczasie zajęty. Ustal z pacjentem nowy termin (zmień datę) przed oznaczeniem jako opłaconej.');
                }
            }

            // Conditional on the status we just read → a concurrent change (patient cancel, cron)
            // is never silently overwritten, and a double click can't send two e-mails.
            const result = await tx.reservation.updateMany({
                where: { id, status: current.status },
                data: { status },
            });
            if (result.count === 0) {
                throw new StatusError(409, 'Status tej wizyty zmienił się w międzyczasie. Odśwież stronę.');
            }

            return { current, updated: { ...current, status } };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        const warnings: string[] = [];

        if (status === 'PAID') {
            await prisma.systemLog.create({
                data: {
                    action: "PŁATNOŚĆ_ZAKSIĘGOWANA_RĘCZNIE",
                    details: `Admin oznaczył rezerwację ${updated.id} (${updated.patientName}) jako opłaconą.`
                }
            });

            const sent = await sendMagicLinkEmail({
                email: updated.email,
                patientName: updated.patientName,
                date: updated.date,
                serviceName: updated.service.name,
                magicToken: updated.magicToken,
                status: "PAID"
            });
            if (!sent) warnings.push("Nie udało się wysłać pacjentowi e-maila z potwierdzeniem. Możesz wysłać go ponownie z menu wizyty.");
        }

        if (status === 'CANCELLED') {
            const wasPaid = current.status === 'PAID';
            if (wasPaid) {
                await prisma.systemLog.create({
                    data: {
                        action: "WYMAGANY_ZWROT_RĘCZNY",
                        details: `Admin anulował opłaconą wizytę ${updated.id} (${updated.patientName}). Pamiętaj o ręcznym zwrocie ${updated.amountPaid ?? updated.service.price} zł.`
                    }
                });
            }

            const sent = await sendCancellationEmail({
                email: updated.email,
                patientName: updated.patientName,
                date: updated.date,
                serviceName: updated.service.name,
                reason: wasPaid
                    ? "Odwołano przez gabinet. Skontaktujemy się z Tobą w sprawie zwrotu opłaty."
                    : "Odwołano przez gabinet"
            });
            if (!sent) warnings.push("Nie udało się wysłać pacjentowi e-maila o odwołaniu wizyty. Poinformuj pacjenta inną drogą.");
        }

        return NextResponse.json({ ...updated, warning: warnings.join(" ") || undefined }, { status: 200 });
    } catch (error) {
        if (error instanceof StatusError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2034") {
            return NextResponse.json({ error: "Wizyta była właśnie zmieniana. Odśwież stronę i spróbuj ponownie." }, { status: 409 });
        }
        return NextResponse.json({ error: 'Nie można zaktualizować rezerwacji' }, { status: 500 });
    }
}

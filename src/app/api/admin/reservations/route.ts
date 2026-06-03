import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {sendMagicLinkEmail} from "@/utils/email-sender";

export async function POST(req: Request) {
    try{
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const body = await req.json();
        const {patientName, email, phone, date, serviceId, status} = body;

        if (!patientName || !email || !phone || !date || !serviceId) {
            return NextResponse.json({message: "Wszystkie pola są wymagane"}, {status: 400});
        }
        const checkFreeSlot = await prisma.reservation.findFirst({
            where: {
                date: new Date(date),
                serviceId,
                status: {
                    not: "CANCELLED"
                }
            }
        });

        if (checkFreeSlot) {
            return NextResponse.json({message: "Ten termin jest już zajęty"}, {status: 400});
        }
        const newReservation = await prisma.reservation.create({
            data: {
                patientName,
                email,
                phone,
                date: new Date(date),
                serviceId,
                status: status || "PAID",
                isManual: true
            },
            include: {
                service: true
            }
        });

        const settings = await prisma.clinicSettings.findUnique({
            where: { id: "global" }
        });

        await sendMagicLinkEmail({
            email: newReservation.email,
            patientName: newReservation.patientName,
            date: newReservation.date,
            serviceName: newReservation.service.name,
            magicToken: newReservation.magicToken,
            status: newReservation.status,
            bankAccount: settings?.bankAccount || null
        });

        return NextResponse.json({success: true, reservation: newReservation}, {status: 201});
    } catch (e) {
        return NextResponse.json({message: "Błąd serwera"}, {status: 500});
    }

}
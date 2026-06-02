import {whitelistSchema} from "@/schemas/waitlist";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";


export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validation = whitelistSchema.safeParse(body);
        if(!validation.success) {
            const firstMessageError = validation.error.issues[0].message;
            return NextResponse.json({error: firstMessageError}, {status: 400});
        }
        const {patientName, email, phone, serviceId, notes} = validation.data;

        const existingEntry = await prisma.waitlist.findFirst( {
            where: {
                email: email.trim().toLowerCase(),
                serviceId: serviceId
            }
        });

        if(existingEntry) {
            return NextResponse.json({error: "Już jesteś na liście oczekujących dla tej usługi"}, {status: 409});
        }

        const newWaitlistEntry = await prisma.waitlist.create({
            data: {
                patientName: patientName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                serviceId,
                notes: notes?.trim() || null
            }
        });
        return NextResponse.json({success: true, data: newWaitlistEntry}, {status: 201});
    }catch (e) {
        return NextResponse.json({error: "Wystąpił błąd podczas dodawania do listy oczekujących"}, {status: 500});
    }
}
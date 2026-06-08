import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {sendFollowUpEmail} from "@/utils/email-sender";


export async function POST(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const resolvedParams = await params;

        const body = await req.json();
        const {message} = body;

        if(!message || message.trim() === "") {
            return NextResponse.json({error: "Wiadomość nie może być pusta"}, {status: 400});
        }

        const reservation = await prisma.reservation.findUnique({
            where: {id: resolvedParams.id}
        })

        if(!reservation) {
            return NextResponse.json({error: "Nie znaleziono rezerwacji"}, {status: 404});
        }
        const emailSent = await sendFollowUpEmail({
            email: reservation.email,
            patientName: reservation.patientName,
            date: reservation.date,
            message: message.trim()
        })

        if(!emailSent) {
            return NextResponse.json({error: "Nie można wysłać wiadomości. Spróbuj ponownie później."}, {status: 500});
        }

        return NextResponse.json({success: true}, {status: 200});
    }catch {
        return NextResponse.json({error: "Wystąpił błąd serwera. Spróbuj ponownie później."}, {status: 500});
    }
}
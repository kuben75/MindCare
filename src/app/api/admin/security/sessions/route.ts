import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";


export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if(!session || !session.user?.email) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const activeSessions = await prisma.deviceSession.findMany({
            where: {
                adminEmail: session.user.email,
                isValid: true
            },
            orderBy: {createdAt: "desc"}
        });
        return NextResponse.json({sessions: activeSessions});
    }catch (e) {
        return NextResponse.json({error: "Wystąpił błąd"}, {status: 500})
    }
}


export async function PATCH(req:Request) {
    try {
        const session = await getServerSession(authOptions);
        if(!session || !session.user?.email) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const {sessionId} = await req.json();
        if(!sessionId) {
            return NextResponse.json({error: "Brak ID sesji"}, {status: 400});
        }

        await prisma.deviceSession.update({
            where: {id: sessionId},
            data: {isValid: false}
        })

        return NextResponse.json({success: true});

    }catch (e) {
        return NextResponse.json({error: "Wystąpił błąd"}, {status: 500})
    }
}
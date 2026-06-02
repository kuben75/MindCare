import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";


export async function PATCH(req: Request, { params}: {params: Promise<{id: string}>})  {
    try {
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const body = await req.json();
        const {privateNotes} = body;

        const resolvedParams = await params;

        const updatedReservation = await prisma.reservation.update({
            where: {id: resolvedParams.id},
            data: {privateNotes}
        });

        return NextResponse.json({success: true, reservation: updatedReservation});

    }  catch (e) {
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
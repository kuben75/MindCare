import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {requireAdmin} from "@/lib/requireAdmin";


export async function PATCH(req: Request, { params}: {params: Promise<{id: string}>})  {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }
        const body = await req.json();
        const {privateNotes} = body;

        const resolvedParams = await params;

        const updatedReservation = await prisma.reservation.update({
            where: {id: resolvedParams.id},
            data: {privateNotes}
        });

        return NextResponse.json({success: true, reservation: updatedReservation});

    }  catch  {
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
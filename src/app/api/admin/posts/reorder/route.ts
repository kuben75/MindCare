import {getServerSession} from "next-auth";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if(!session) {
        return NextResponse.json({ error: "Brak autoryzacji"}, {status: 401});
    }
    try {
        const body = await req.json();
        const {updates} = body;
        if(!Array.isArray(updates)) {
            return NextResponse.json({ error: "Nieprawidłowe dane"}, {status: 400});
        }
        await prisma.$transaction(
            updates.map((update: {id: string; order: number}) =>
                prisma.post.update({
                    where: {id: update.id},
                    data: {order: update.order}
                })
            )
        )
        return NextResponse.json({message: "Kolejność postów została zaktualizowana pomyślnie"});
    }catch(e) {
        console.error("Błąd podczas aktualizacji kolejności postów:", e);
        return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji kolejności postów"}, {status: 500});
    }
}

import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({message: "Invaid credentials"}, {status: 401});
    }
        const resolvedParams = await params;

        await prisma.waitlist.delete({
            where: {id: resolvedParams.id}
        });

        return NextResponse.json({success: true});
    }catch {
        return NextResponse.json({error: "Wystąpił błąd podczas usuwania z listy oczekujących"}, {status: 500});
    }
}
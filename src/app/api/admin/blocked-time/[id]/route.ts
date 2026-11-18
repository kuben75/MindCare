import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {requireAdmin} from "@/lib/requireAdmin"


export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }
        const resolvedParams = await params;

        await prisma.blockedTime.delete({
            where: {id: resolvedParams.id}
        });

        return NextResponse.json({message: "Usunięto pomyślnie"}, {status: 200});
    }catch {
        return NextResponse.json({message: "Wystąpił błąd"}, {status: 500});
    }
}
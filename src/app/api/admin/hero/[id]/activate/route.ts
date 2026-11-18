
import prisma from "@/infrastructure/prisma";
import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/requireAdmin"

export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    try {
        const {id} = await params;
        await prisma.$transaction([
            prisma.heroTemplate.updateMany({
                data: {isActive: false}
            }),
            prisma.heroTemplate.update({
                where: {id},
                data: {isActive: true}
            })
        ]);
        return NextResponse.json({ message: "Szablon został pomyślnie aktywowany na stronie głównej." });
    }catch {
        return NextResponse.json({error: "Nie można aktywować szablonu"}, {status: 500});
    }
}

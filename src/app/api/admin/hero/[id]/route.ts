import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {requireAdmin} from "@/lib/requireAdmin"
import {heroTemplateSchema} from "@/schemas/hero"

export async function PUT(req: Request, {params}: {params: Promise<{id: string}>}) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    try{
        const {id} = await params;
        const body = await req.json().catch(() => null);
        const validation = heroTemplateSchema.safeParse(body);
        if (!validation.success) {
            const message = validation.error.issues[0]?.message || "Nieprawidłowe dane szablonu";
            return NextResponse.json({ error: message }, { status: 400 });
        }
        const updatedTemplate = await prisma.heroTemplate.update({
            where: {id},
            data: validation.data
        });
        return NextResponse.json(updatedTemplate);
    }catch  {
        return NextResponse.json({message: "Error updating template"}, {status: 500});
    }
}
export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    try{
        const {id} = await params;
        const template = await prisma.heroTemplate.findUnique({where: {id}});
        if(template?.isActive) {
            return NextResponse.json({message: "Nie możesz usunąć aktywnego szablonu."}, {status: 400});
        }
        await prisma.heroTemplate.delete({where: {id}});

        return NextResponse.json({success: true});
    }catch  {
        return NextResponse.json({message: "Error deleting template"}, {status: 500});
    }
}
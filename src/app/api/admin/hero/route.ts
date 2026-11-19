
import prisma from "@/infrastructure/prisma";
import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/requireAdmin";
import {heroTemplateSchema} from "@/schemas/hero";


export async function GET() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const template = await prisma.heroTemplate.findMany({
            orderBy: {createdAt: 'desc'}
        });
        return NextResponse.json(template);
    }catch  {
        return NextResponse.json({error: "Nie można pobrać danych"}, {status: 500});
    }
}

export async function POST(req: Request) {

    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    try {
        const body = await req.json().catch(() => null);
        const validation = heroTemplateSchema.safeParse(body);
        if (!validation.success) {
            const message = validation.error.issues[0]?.message || "Nieprawidłowe dane szablonu";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const count = await prisma.heroTemplate.count();
        const makeActive = count === 0;
        const template = await prisma.heroTemplate.create({
            data: {
                ...validation.data,
                isActive: makeActive
            }
    });
        return NextResponse.json(template);
    }catch {
        return NextResponse.json({error: "Nie można utworzyć szablonu"}, {status: 500});
    }
}
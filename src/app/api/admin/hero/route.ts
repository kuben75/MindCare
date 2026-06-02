import prisma from "@/infrastructure/prisma";
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";


export async function GET() {
    try {
        const template = await prisma.heroTemplate.findMany({
            orderBy: {createdAt: 'desc'}
        });
        return NextResponse.json(template);
    }catch (e) {
        console.error(e);
        return NextResponse.json({error: "Nie można pobrać danych"}, {status: 500});
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    try {
        const body = await req.json();
        const count = await prisma.heroTemplate.count();
        const makeActive = count === 0;
        const template = await prisma.heroTemplate.create({
            data: {
                title: body.title,
                subtitle: body.subtitle,
                imageUrl: body.imageUrl,
                imageStyle: body.imageStyle,
                layout: body.layout,
                showPrimaryButton: body.showPrimaryButton,
                primaryButtonText: body.primaryButtonText,
                primaryButtonLink: body.primaryButtonLink,
                showZnanyLekarz: body.showZnanyLekarz,
                isActive: makeActive
            }
    });
        return NextResponse.json(template);
    }catch (e) {
        console.error(e);
        return NextResponse.json({error: "Nie można utworzyć szablonu"}, {status: 500});
    }
}
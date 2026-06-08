import {getServerSession} from "next-auth";
import prisma from "@/infrastructure/prisma";
import {NextResponse} from "next/server";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
    const session = await getServerSession(authOptions);
    if (!session) {
       return NextResponse.json({error: "Unauthorized"}, {status: 401});
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

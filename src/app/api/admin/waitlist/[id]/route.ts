import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";


export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const resolvedParams = await params;

        await prisma.waitlist.delete({
            where: {id: resolvedParams.id}
        });

        return NextResponse.json({success: true});
    }catch (e) {
        return NextResponse.json({error: "Wystąpił błąd podczas usuwania z listy oczekujących"}, {status: 500});
    }
}
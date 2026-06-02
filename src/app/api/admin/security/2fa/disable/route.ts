import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";



export async function POST() {
    try{
        const session = await getServerSession(authOptions);

        if(!session || !session.user?.email) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        await prisma.admin.update({
            where: {email: session.user.email},
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                recoveryCodes: "[]"
            }
        });
        return NextResponse.json({success: true});

    }catch (e) {
        return NextResponse.json({error: "Wystąpił błąd"}, {status: 500})
    }
}
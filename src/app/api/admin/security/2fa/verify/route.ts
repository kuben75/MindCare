import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {verify} from "otplib";


export async function POST(req: Request) {
    try{
        const session = await getServerSession(authOptions);

        if(!session || !session.user?.email) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const body = await req.json();
        const {code} = body;

        const admin = await prisma.admin.findUnique({
            where: {email: session.user.email}
        })

        if(!admin || !admin.twoFactorSecret) {
            return NextResponse.json({error: "Brak konfiguracji 2FA"}, {status: 400})
        }

        const result = await verify({
            token: code,
            secret: admin.twoFactorSecret
        });

        if(!result.valid) {
            return NextResponse.json({error: "Nieprawidłowy kod. Spróbuj ponownie"}, {status: 400})
        }

        await prisma.admin.update({
            where: {email: admin.email},
            data: {twoFactorEnabled: true}
        });

        return NextResponse.json({success: true});
    }catch (e) {
        return NextResponse.json({error: "Wystąpił błąd"}, {status: 500})
    }
}
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import {generateRecoveryCodes} from "@/utils/auth-helpers";

export async function POST() {
    try{
        const session = await getServerSession(authOptions);

        if(!session || !session.user?.email) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const admin = await prisma.admin.findUnique({
            where: {email: session.user.email}
        })

        if(!admin) {
            return NextResponse.json({error: "Brak admina"}, {status: 404})
        }

        const secret = admin.twoFactorSecret || generateSecret();
        const existingCodes = JSON.parse(admin.recoveryCodes || "[]");
        const recoveryCodes = existingCodes.length > 0 ? existingCodes : generateRecoveryCodes();

        await prisma.admin.update({
            where: {email: admin.email},
            data: {
                twoFactorSecret: secret,
                recoveryCodes: JSON.stringify(recoveryCodes)
            }
        })

        const otpauthUrl = generateURI({
            issuer: "Psychologia Odbicia",
            label: admin.email,
            secret: secret,
        });

        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

        return NextResponse.json({qrCodeUrl, recoveryCodes});
        
    }catch  {
        return NextResponse.json({error: "Wystąpił błąd"}, {status: 500})
    }
}
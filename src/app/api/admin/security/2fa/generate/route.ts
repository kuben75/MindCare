import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { generateRecoveryCodes } from "@/utils/auth-helpers";
import { encryptTotpSecret, hashRecoveryCode } from "@/lib/two-factor";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST() {
    try {
        const adminSession = await requireAdmin();
        if(!adminSession) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }

        const admin = await prisma.admin.findUnique({
            where: { email: adminSession.email },
        });

        if (!admin) {
            return NextResponse.json({ error: "Nie znaleziono konta" }, { status: 404 });
        }

        if (admin.twoFactorEnabled) {
            return NextResponse.json(
                { error: "Weryfikacja dwuetapowa jest już aktywna. Wyłącz ją najpierw, aby wygenerować nowy klucz." },
                { status: 409 }
            );
        }

        const secret = generateSecret();
        const recoveryCodes = generateRecoveryCodes();

        await prisma.admin.update({
            where: { email: admin.email },
            data: {
                twoFactorSecret: encryptTotpSecret(secret),
                recoveryCodes: JSON.stringify(recoveryCodes.map(hashRecoveryCode)),
                lastTotpTimeStep: null,
            },
        });

        const otpauthUrl = generateURI({
            issuer: "Psychologia Odbicia",
            label: admin.email,
            secret: secret,
        });

        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

        return NextResponse.json({ qrCodeUrl, recoveryCodes });
    } catch {
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import bcrypt from "bcryptjs";
import {requireAdmin} from "@/lib/requireAdmin";
import { countRecentFailures, verifyAndConsumeTotp } from "@/lib/two-factor";

const FAILED_ACTION = "FAILED_2FA_DISABLE";
const MAX_FAILURES = 5;

export async function POST(req: Request) {
    try {
        const sessionAdmin = await requireAdmin();
        if (!sessionAdmin) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }

        const body = await req.json().catch(() => ({}));
        const password = typeof body?.password === "string" ? body.password : "";
        const code = typeof body?.code === "string" ? body.code.trim() : "";

        if (!password || !code) {
            return NextResponse.json(
                { error: "Podaj obecne hasło oraz kod z aplikacji uwierzytelniającej" },
                { status: 400 }
            );
        }

        const admin = await prisma.admin.findUnique({
            where: { email: sessionAdmin.email},
        });

        if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecret) {
            return NextResponse.json({ error: "2FA nie jest włączone" }, { status: 400 });
        }

        if (await countRecentFailures(FAILED_ACTION, admin.email) >= MAX_FAILURES) {
            return NextResponse.json({ error: "Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut." }, { status: 429 });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        const isTotpValid = isPasswordValid && await verifyAndConsumeTotp(admin, code);

        if (!isPasswordValid || !isTotpValid) {
            await prisma.systemLog.create({ data: { action: FAILED_ACTION, details: admin.email } });
            return NextResponse.json(
                { error: "Nieprawidłowe hasło lub kod weryfikacyjny" },
                { status: 403 }
            );
        }

        await prisma.admin.update({
            where: { email: admin.email },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                recoveryCodes: "[]",
                lastTotpTimeStep: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}
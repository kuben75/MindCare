import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { countRecentFailures, verifyAndConsumeTotp } from "@/lib/two-factor";

const FAILED_ACTION = "FAILED_2FA_ENROLL";
const MAX_FAILURES = 10;

export async function POST(req: Request) {
    try {
       const adminSession = await requireAdmin();
       if(!adminSession) {
        return NextResponse.json({error: "Invalid credentials"}, {status: 401});
       }

        const body = await req.json().catch(() => ({}));
        const code = typeof body?.code === "string" ? body.code.trim() : "";

        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json({ error: "Kod musi składać się z 6 cyfr" }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { email: adminSession.email },
        });

        if (!admin || !admin.twoFactorSecret) {
            return NextResponse.json({ error: "Brak aktywnej konfiguracji 2FA" }, { status: 400 });
        }

        if (admin.twoFactorEnabled) {
            return NextResponse.json({ error: "2FA jest już włączone" }, { status: 409 });
        }

        if (await countRecentFailures(FAILED_ACTION, admin.email) >= MAX_FAILURES) {
            return NextResponse.json({ error: "Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut." }, { status: 429 });
        }

        const isValid = await verifyAndConsumeTotp(admin, code);

        if (!isValid) {
            await prisma.systemLog.create({ data: { action: FAILED_ACTION, details: admin.email } });
            return NextResponse.json({ error: "Nieprawidłowy kod. Spróbuj ponownie" }, { status: 400 });
        }

        await prisma.admin.update({
            where: { email: admin.email },
            data: { twoFactorEnabled: true },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}
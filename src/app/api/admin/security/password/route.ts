import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/requireAdmin";
import { countRecentFailures } from "@/lib/two-factor";

const FAILED_ACTION = "FAILED_PASSWORD_CHANGE";
const MAX_FAILURES = 5;
const MIN_PASSWORD_LENGTH = 12;

export async function POST(req: Request) {
    try {
        const adminSession = await requireAdmin();
        if(!adminSession) {
         return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }

        const body = await req.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string"
            || !currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: "Wszystkie pola są wymagane" }, { status: 400 });
        }

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            return NextResponse.json({ error: `Nowe hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków` }, { status: 400 });
        }

        // bcrypt silently ignores everything past 72 bytes.
        if (Buffer.byteLength(newPassword, "utf8") > 72) {
            return NextResponse.json({ error: "Nowe hasło jest za długie (maks. 72 bajty)" }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: "Nowe hasła nie są identyczne" }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { email: adminSession.email }
        });

        if (!admin || !admin.password) {
            return NextResponse.json({ error: "Konto administratora nie istnieje" }, { status: 404 });
        }

        if (await countRecentFailures(FAILED_ACTION, admin.email) >= MAX_FAILURES) {
            return NextResponse.json({ error: "Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut." }, { status: 429 });
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isCurrentValid) {
            await prisma.systemLog.create({ data: { action: FAILED_ACTION, details: admin.email } });
            return NextResponse.json({ error: "Obecne hasło jest nieprawidłowe" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.admin.update({
            where: { email: admin.email },
            data: { password: hashedPassword }
        });

        // Log out every other device — a password change must cut off a possibly compromised session.
        await prisma.deviceSession.updateMany({
            where: { adminEmail: admin.email, isValid: true, id: { not: adminSession.sessionId } },
            data: { isValid: false }
        });

        await prisma.systemLog.create({
            data: {
                action: "ZMIANA_HASŁA",
                details: `Administrator ${admin.email} pomyślnie zmienił hasło do panelu.`
            }
        });

        return NextResponse.json({ success: true, message: "Hasło zostało pomyślnie zmienione." }, { status: 200 });

    } catch (error) {
        console.error("Błąd podczas zmiany hasła:", error);
        return NextResponse.json({ error: "Wystąpił błąd serwera podczas zmiany hasła" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: "Wszystkie pola są wymagane" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Nowe hasło musi mieć co najmniej 8 znaków" }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: "Nowe hasła nie są identyczne" }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { email: session.user.email }
        });

        if (!admin || !admin.password) {
            return NextResponse.json({ error: "Konto administratora nie istnieje" }, { status: 404 });
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isCurrentValid) {
            return NextResponse.json({ error: "Obecne hasło jest nieprawidłowe" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.admin.update({
            where: { email: admin.email },
            data: { password: hashedPassword }
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
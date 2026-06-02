import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/infrastructure/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const settings = await prisma.clinicSettings.upsert({
            where: { id: "global" },
            update: {},
            create: {
                id: "global",
                clinicName: "Paulina Kawka-Mirek",
                email: "paulinakmirek@gmail.com",
                phone: "",
                address: "",
            }
        });
        return NextResponse.json(settings, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: "Nie można pobrać ustawień" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const {
            clinicName, email, phone, address, bankAccount,
            instagramUrl, facebookUrl, linkedinUrl, znanyLekarzUrl
        } = body;

        const updatedSettings = await prisma.clinicSettings.update({
            where: { id: "global" },
            data: {
                clinicName,
                email,
                phone,
                address,
                bankAccount,
                instagramUrl,
                facebookUrl,
                linkedinUrl,
                znanyLekarzUrl
            }
        });

        await prisma.systemLog.create({
            data: {
                action: "AKTUALIZACJA_USTAWIEŃ",
                details: "Zaktualizowano globalne dane kontaktowe i ustawienia gabinetu."
            }
        });

        return NextResponse.json(updatedSettings, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: "Błąd podczas zapisywania ustawień" }, { status: 500 });
    }
}
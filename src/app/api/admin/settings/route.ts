import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/infrastructure/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const settings = await prisma.clinicSettings.upsert({
            where: { id: "global" },
            update: {},
            create: {
                id: "global",
                clinicName: process.env.CLINIC_NAME || "Gabinet Psychoterapii Paulina Kawka-Mirek",
                email: process.env.ADMIN_EMAIL || "kontakt@paulinakawkamirek.pl",
                phone: process.env.CLINIC_PHONE || "+48 000 000 000",
                address: "",
                znanyLekarzUrl: "https://www.znanylekarz.pl/paulina-kawka-mirek/psycholog/wronki",
                linkedinUrl: "https://www.linkedin.com/in/paulina-kawka-mirek-3a2224253/",
                instagramUrl: "https://www.instagram.com/psychologia_odbicia/",
                facebookUrl: "https://www.facebook.com/profile.php?id=61586481414788",
                nipNumber: "",
                bankAccount: ""
            }
        });

        return NextResponse.json(settings, { status: 200 });
    } catch (error) {
        console.error("Błąd pobierania ustawień gabinetu:", error);
        return NextResponse.json({ error: "Nie można pobrać ustawień" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const {
            clinicName, email, phone, address, bankAccount,
            instagramUrl, facebookUrl, linkedinUrl, znanyLekarzUrl, nipNumber
        } = body;

        const updatedSettings = await prisma.clinicSettings.update({
            where: { id: "global" },
            data: {
                clinicName: clinicName?.trim(),
                email: email?.trim().toLowerCase(),
                phone: phone?.trim(),
                address: address?.trim(),
                bankAccount: bankAccount?.trim(),
                instagramUrl: instagramUrl?.trim(),
                facebookUrl: facebookUrl?.trim(),
                linkedinUrl: linkedinUrl?.trim(),
                znanyLekarzUrl: znanyLekarzUrl?.trim(),
                nipNumber: nipNumber?.trim()
            }
        });

        await prisma.systemLog.create({
            data: {
                action: "AKTUALIZACJA_USTAWIEŃ",
                details: `Admin ${session.user.email} zaktualizował globalne dane gabinetu i numer konta.`
            }
        });

        return NextResponse.json(updatedSettings, { status: 200 });
    } catch (error) {
        console.error("Błąd zapisu ustawień gabinetu:", error);
        return NextResponse.json({ message: "Błąd podczas zapisywania ustawień" }, { status: 500 });
    }
}
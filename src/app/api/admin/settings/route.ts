import prisma from "@/infrastructure/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { firstIssue, settingsSchema } from "@/schemas/admin";

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({message: "Invaid credentials"}, {status: 401});
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
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({message: "Invaid credentials"}, {status: 401});
    }

    try {
        const body = await req.json().catch(() => null);
        const validation = settingsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: firstIssue(validation.error), error: firstIssue(validation.error) }, { status: 400 });
        }

        // Social links are rendered as href on every public page — only http(s) is accepted.
        const updatedSettings = await prisma.clinicSettings.update({
            where: { id: "global" },
            data: validation.data
        });

        await prisma.systemLog.create({
            data: {
                action: "AKTUALIZACJA_USTAWIEŃ",
                details: `Admin zaktualizował globalne dane gabinetu i numer konta.`
            }
        });

        return NextResponse.json(updatedSettings, { status: 200 });
    } catch (error) {
        console.error("Błąd zapisu ustawień gabinetu:", error);
        return NextResponse.json({ message: "Błąd podczas zapisywania ustawień" }, { status: 500 });
    }
}
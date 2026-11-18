import prisma from "@/infrastructure/prisma";
import SettingsClient from "@/app/admin/dashboard/settings/SettingsClient";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({message: "Invaid credentials"}, {status: 401});
    }
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

    return (
        <div className="max-w-[1000px] mx-auto w-full px-2 sm:px-4 pb-16">
            <SettingsClient initialSettings={settings} />
        </div>
    );
}
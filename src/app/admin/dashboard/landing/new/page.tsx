import HeroForm from "@/components/layout/HeroForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export default async function NewLandingTemplatePage() {
    const admin = await requireAdmin();
if (!admin) {
    return NextResponse.json({message: "Invaid credentials"}, {status: 401});
}
    return <HeroForm />;
}       
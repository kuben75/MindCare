"use client";

import { useLandingPage } from "@/hooks/useLandingPage";
import LandingPageCreator from "@/app/admin/dashboard/landing/LandingPageCreator";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export default async function LandingDashboardPage() {
    const admin = await requireAdmin();
if (!admin) {
    return NextResponse.json({message: "Invaid credentials"}, {status: 401});
}
    const { templates, isLoading, actionLoading, handleActivate, handleDelete, toast, hideToast } = useLandingPage();

    return (
        <LandingPageCreator
            templates={templates}
            isLoading={isLoading}
            actionLoading={actionLoading}
            handleActivate={handleActivate}
            handleDelete={handleDelete}
            toast={toast}
            hideToast={hideToast}
        />
    )

}
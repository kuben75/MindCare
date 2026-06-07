"use client";

import { useLandingPage } from "@/hooks/useLandingPage";
import LandingPageCreator from "@/app/admin/dashboard/landing/LandingPageCreator";

export default function LandingDashboardPage() {
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
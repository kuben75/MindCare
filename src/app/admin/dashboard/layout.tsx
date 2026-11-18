import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";
import DashboardClientLayout from "./DashboardClientLayout";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await requireAdmin();
    if (!admin) {
        redirect("/admin/login");
    }

    return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
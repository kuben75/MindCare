import { requireAdminPage } from "@/lib/requireAdmin";
import DashboardClient from "./DashboardClient";
import {getDashboardDate} from "@/services/dashboard.service";
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    await requireAdminPage();


    const payload = await getDashboardDate();

    return <DashboardClient data={payload} />;
}
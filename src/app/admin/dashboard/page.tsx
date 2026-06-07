import DashboardClient from "./DashboardClient";
import {getDashboardDate} from "@/services/dashboard.service";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const payload = await getDashboardDate();

    return <DashboardClient data={payload} />;
}
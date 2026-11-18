import DashboardClient from "./DashboardClient";
import {getDashboardDate} from "@/services/dashboard.service";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({message: "Invaid credentials"}, {status: 401});
    }
    const payload = await getDashboardDate();

    return <DashboardClient data={payload} />;
}
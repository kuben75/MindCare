import prisma from "@/infrastructure/prisma";
import { redirect } from "next/navigation";
import SecurityHub from "@/app/admin/dashboard/security/SecurityHub";
import { requireAdmin } from "@/lib/requireAdmin";  
export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
    const sessionAdmin = await requireAdmin();
if (!sessionAdmin) {
   redirect("/admin/login");
}

    const admin = await prisma.admin.findUnique({
        where: { email: sessionAdmin.email }
    });
    if (!admin) {
        redirect("/admin/login");
    }

    const currentSessionId = sessionAdmin.sessionId || null;

    return (
        <div className="max-w-[1200px] mx-auto w-full px-2 sm:px-4 pb-16">
            <SecurityHub is2FAEnabled={admin.twoFactorEnabled} currentSessionId={currentSessionId} />
        </div>
    );
}
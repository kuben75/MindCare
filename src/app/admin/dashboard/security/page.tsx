import prisma from "@/infrastructure/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SecurityHub from "@/app/admin/dashboard/security/SecurityHub";

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        redirect("/admin/login");
    }

    const admin = await prisma.admin.findUnique({
        where: { email: session.user.email }
    });
    if (!admin) {
        redirect("/admin/login");
    }

    const currentSessionId = session.sessionId || null;

    return (
        <div className="max-w-[1200px] mx-auto w-full px-2 sm:px-4 pb-16">
            <SecurityHub is2FAEnabled={admin.twoFactorEnabled} currentSessionId={currentSessionId} />
        </div>
    );
}
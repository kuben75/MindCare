import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/infrastructure/prisma";

export type AuthenticatedAdmin = {
    email: string;
    sessionId: string;
};


export async function requireAdmin(): Promise<AuthenticatedAdmin | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.sessionId) {
        return null;
    }

    const deviceSession = await prisma.deviceSession.findUnique({
        where: { id: session.sessionId },
        select: {
            isValid: true,
            adminEmail: true,
        },
    });

    if (!deviceSession || !deviceSession.isValid || deviceSession.adminEmail !== session.user.email) {
        return null;
    }

    return {
        email: session.user.email,
        sessionId: session.sessionId,
    };
}
/**
 * For admin server components: every page checks the session itself instead of relying on the
 * layout (layouts are not re-run on client-side navigation / partial RSC requests).
 */
export async function requireAdminPage(): Promise<AuthenticatedAdmin> {
    const admin = await requireAdmin();
    if (!admin) redirect("/admin/login");
    return admin;
}

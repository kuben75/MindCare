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
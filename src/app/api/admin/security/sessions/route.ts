import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const activeSessions = await prisma.deviceSession.findMany({
            where: {
                adminEmail: admin.email,
                isValid: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ sessions: activeSessions });
    } catch {
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";

        if (!sessionId) {
            return NextResponse.json({ error: "Brak poprawnego ID sesji" }, { status: 400 });
        }

        const updated = await prisma.deviceSession.updateMany({
            where: {
                id: sessionId,
                adminEmail: admin.email,
            },
            data: { isValid: false },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Nie znaleziono sesji" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}
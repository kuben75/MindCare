import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";

export async function GET(req: Request) {

    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const expirationLimit = new Date();
        expirationLimit.setMinutes(expirationLimit.getMinutes() - 40);

        const result = await prisma.reservation.updateMany({
            where: {
                status: "PENDING",
                isManual: false,
                createdAt: {
                    lt: expirationLimit
                }
            },
            data: {
                status: "CANCELLED"
            }
        });

        if (result.count > 0) {
            await prisma.systemLog.create({
                data: {
                    action: "CRON_CZYSZCZENIE_KOSZYKÓW",
                    details: `System automatycznie uwolnił ${result.count} nieopłaconych terminów.`
                }
            });
        }

        return NextResponse.json({ success: true, freedSlots: result.count });

    } catch  {
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import {getWarsawNow} from "@/utils/warsaw-time";

export async function GET(req: Request) {

    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const expirationLimit = getWarsawNow().minus({minutes: 30}).toJSDate();

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
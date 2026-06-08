import prisma from "@/infrastructure/prisma";
import {NextResponse} from "next/server";


export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: {isActive: true},
            orderBy: {name: "asc"}
        });
        return NextResponse.json(services, {status: 200});
    } catch  {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
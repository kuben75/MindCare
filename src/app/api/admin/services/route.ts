import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {requireAdmin} from "@/lib/requireAdmin";
import {firstIssue, serviceCreateSchema} from "@/schemas/admin";

export async function GET() {
    try{
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({message: "Invalid credentials"}, {status: 401});
        }

        const services = await prisma.service.findMany({
            orderBy: {name: "asc"}
        })
        return NextResponse.json(services, {status: 200});
    }catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function POST(req:Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({message: "Invalid credentials"}, {status: 401});
        }
        const body = await req.json().catch(() => null);
        const validation = serviceCreateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({error: firstIssue(validation.error)}, {status: 400});
        }

        const newService = await prisma.service.create({
            data: { ...validation.data, isActive: true }
        });
        return NextResponse.json(newService, {status: 201});
    }catch  {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
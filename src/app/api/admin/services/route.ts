import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";


export async function GET() {
    try{
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
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
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const body = await req.json();
        const {name, duration, price} = body;
        if(!name || !duration || price === undefined) {
            return NextResponse.json({error: "Wszystkie pola są wymagane"}, {status: 400});
        }

        const newService = await prisma.service.create({
            data: {
                name: name.trim(),
                duration: parseInt(duration),
                price: parseFloat(price),
                isActive: true,
            }
        });
        return NextResponse.json(newService, {status: 201});
    }catch  {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
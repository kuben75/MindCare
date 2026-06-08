import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";


export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
    try{
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const resolvedParams = await params;
        const body = await req.json();
        const {name, duration, price, isActive} = body;

        const updatedService = await prisma.service.update({
            where: {id: resolvedParams.id},
            data: {
                ...(name && {name: name.trim()}),
                ...(duration && {duration: parseInt(duration)}),
                ...(price !== undefined && {price: parseFloat(price)}),
                ...(isActive !== undefined && {isActive})
            }
        });
        return NextResponse.json(updatedService, {status: 200});
    }catch  {
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const resolvedParams = await params;
        const existingReservations = await prisma.reservation.count({
            where: {serviceId: resolvedParams.id}
        });
        if (existingReservations > 0) {
            return NextResponse.json(
                { error: "Nie można usunąć tej usługi, ponieważ w systemie istnieją już pacjenci do niej przypisani. Zamiast tego użyj opcji 'Ukryj usługę'." },
                { status: 409 }
            );
        }

        await prisma.service.delete({
            where: {id: resolvedParams.id}
        });
        return NextResponse.json({message: "Usługa została usunięta"}, {status: 200});

    }catch {

    }
}
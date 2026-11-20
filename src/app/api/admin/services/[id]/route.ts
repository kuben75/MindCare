import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { firstIssue, serviceUpdateSchema } from "@/schemas/admin";


export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
    try{
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({message: "Invalid credentials"}, {status: 401});
        }

        const resolvedParams = await params;
        const body = await req.json().catch(() => null);
        const validation = serviceUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({error: firstIssue(validation.error)}, {status: 400});
        }

        const updatedService = await prisma.service.update({
            where: {id: resolvedParams.id},
            data: validation.data
        });
        return NextResponse.json(updatedService, {status: 200});
    }catch  {
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
         const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({message: "Invalid credentials"}, {status: 401});
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
            return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
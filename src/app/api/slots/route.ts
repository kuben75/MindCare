import {NextResponse} from "next/server";
import {getPublicSlots} from "@/services/availability.service";

export async function GET(req: Request) {
    try {
        const {searchParams} = new URL(req.url);
        const startDateParam = searchParams.get('startDate');

        if (!startDateParam) {
            return NextResponse.json({error: 'Brak daty startowej'}, {status: 400});
        }

        // startDate is a calendar day in Polish time ("yyyy-MM-dd").
        const days = await getPublicSlots(startDateParam);
        if (!days) {
            return NextResponse.json({error: 'Nieprawidłowa data startowa (oczekiwano RRRR-MM-DD)'}, {status: 400});
        }

        return NextResponse.json({ days }, { status: 200 });
    } catch {
        return NextResponse.json({error: 'Nie można pobrać dostępnych slotów'}, {status: 500});
    }
}

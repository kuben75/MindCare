import prisma from "@/infrastructure/prisma";
import AdminCalendar from "./AdminCalendar";

export const dynamic = 'force-dynamic';

export default async function AdminCalendarPage() {
    const reservations = await prisma.reservation.findMany({
        include: { service: true },
        orderBy: { date: 'asc' }
    });

    return (
        <div className="p-4 sm:p-8 lg:p-10 animate-fade-in max-w-[1600px] mx-auto">
            <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Planowanie i Zarządzanie
                </p>
                <h1 className="text-3xl font-serif text-graphite dark:text-zinc-100 tracking-tight">
                    Terminarz
                </h1>
                <p className="text-graphite/60 dark:text-zinc-400 text-sm mt-1.5 font-medium">
                    Zarządzaj rezerwacjami, przeglądaj harmonogram i sprawdzaj szczegóły wizyt.
                </p>
            </div>

            <AdminCalendar initialReservations={reservations}/>
        </div>
    );
}
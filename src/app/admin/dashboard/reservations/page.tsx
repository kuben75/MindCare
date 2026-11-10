import prisma from "@/infrastructure/prisma";
import ReservationsManager from "./ReservationsManager";

export const dynamic = 'force-dynamic';

export default async function AdminReservationsPage() {
    const reservations = await prisma.reservation.findMany({
        include: { service: true },
        orderBy: { date: 'asc' }
    });

    const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="p-4 sm:p-6 lg:p-10 animate-fade-in text-graphite dark:text-zinc-100 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-1.5 sm:mb-2">
                        Zarządzanie rezerwacjami
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-serif text-graphite dark:text-white tracking-wide mb-1 transition-colors">
                        Rezerwacje
                    </h1>
                    <p className="text-graphite/60 dark:text-zinc-400 text-xs sm:text-sm transition-colors">
                        Zarządzaj wizytami pacjentów, sprawdzaj historię i płatności.
                    </p>
                </div>
                <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-zinc-800/50 border border-beige-dark/20 dark:border-zinc-700/50 rounded-xl flex items-center gap-2.5 shadow-sm">
                    <span className="text-xs sm:text-sm font-medium text-graphite/80 dark:text-zinc-300">
                        Rejestr całkowity: <strong className="text-graphite dark:text-white">{reservations.length}</strong>
                    </span>
                </div>
            </div>

            <ReservationsManager initialReservations={reservations} services={services}/>
        </div>
    );
}
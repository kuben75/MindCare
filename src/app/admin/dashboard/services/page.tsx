import prisma from "@/infrastructure/prisma";
import ServiceManager from "@/app/admin/dashboard/services/ServiceManager";

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
    const initialServices = await prisma.service.findMany({
        orderBy: { name: "asc" }
    });

    return (
        <div className="p-4 sm:p-8 lg:p-10 animate-fade-in max-w-[1400px] mx-auto">
            <div className="mb-10 max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Zarządzaj swoim cennikiem
                </p>
                <h1 className="text-3xl font-serif tracking-tight mb-1.5 text-graphite dark:text-white transition-colors">
                    Katalog Usług
                </h1>
                <p className="text-graphite/60 dark:text-zinc-400 text-sm font-medium transition-colors leading-relaxed">
                    Stwórz swój cennik. Dodaj konsultacje, terapie dla par lub vouchery. Usługi niewidoczne nie pojawią
                    się w kalendarzu pacjentów, ale nadal będą dostępne dla Twoich obecnych klientów.
                </p>
            </div>

            <ServiceManager initialServices={initialServices}/>
        </div>
    );
}
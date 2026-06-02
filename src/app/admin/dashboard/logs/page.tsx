import prisma from "@/infrastructure/prisma";
import SystemLogsViewer from "@/app/admin/dashboard/logs/SystemLogsViewer";

export const dynamic = 'force-dynamic';

export default async function LogsPage({searchParams}: {searchParams: Promise<{page?: string}>}) {
    const resolvedParams = await searchParams;
    const currentPage = Number(resolvedParams.page) || 1;
    const pageSize = 20;

    const [logs, totalCount] = await Promise.all([
        prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc'},
            skip: (currentPage - 1) * pageSize,
            take: pageSize
        }),
        prisma.systemLog.count()
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="space-y-8 md:space-y-10 animate-fade-in pb-12">
            <header className="max-w-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Panel administratora
                </p>
                <h1 className="text-3xl lg:text-4xl font-serif text-graphite dark:text-white tracking-wide leading-tight transition-colors">
                    Dziennik Systemowy
                </h1>
                <p className="text-graphite/60 dark:text-zinc-400 text-sm mt-3 leading-relaxed">
                    Rejestr zdarzeń i prób logowania w celach bezpieczeństwa (pokazuje ostatnie 100 wpisów).
                </p>
            </header>

            <SystemLogsViewer
                logs={logs}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
            />
        </div>
    );
}
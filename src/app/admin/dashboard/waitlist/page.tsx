import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/infrastructure/prisma";
import WaitlistManager from "@/app/admin/dashboard/waitlist/WaitlistManager";
import InfoTooltip from "@/components/ui/InfoTooltip";

export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/admin/login');
    }

    const waitlist = await prisma.waitlist.findMany({
        include: { service: true },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="p-4 sm:p-8 lg:p-10 animate-fade-in max-w-[1400px] mx-auto space-y-8">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                        Lista rezerwowa
                    </p>
                    <div className="flex items-center justify-between gap-2">
                    <h1 className="text-3xl font-serif text-graphite dark:text-zinc-100 tracking-tight">
                        Lista rezerwowa
                    </h1>
                    <InfoTooltip
                        title="Jak działa ta lista?"
                        description="Gdy w Twoim kalendarzu brakuje miejsc, pacjenci mogą zapisać się tutaj na oczekiwanie. Jeśli zwolni się termin, skontaktuj się z wybraną osobą telefonicznie lub mailowo, aby umówić wizytę ręcznie w kalendarzu. Kliknięcie 'Zrobione' po prostu usuwa wpis, nie wysyłając żadnych automatycznych wiadomości."
                    />
                    </div>
                    <p className="text-graphite/60 dark:text-zinc-400 text-sm mt-1.5 font-medium">
                        Kolejka pacjentów oczekujących na wolny termin w gabinecie.
                    </p>
                </div>
                <div
                    className="px-5 py-2.5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse" />
                    <span className="text-xs font-bold text-graphite/60 dark:text-zinc-400 uppercase tracking-widest">
                        Oczekujących: <strong className="text-graphite dark:text-white ml-1 text-sm">{waitlist.length}</strong>
                    </span>
                </div>
            </div>

            <WaitlistManager initialWaitlist={waitlist} />
        </div>
    );
}
"use client";

import { TWaitlistWithService } from "@/types/waitlist";
import { Toast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import {useWaitlistManager} from "@/hooks/useWaitlistManager";

export default function WaitlistManager({ initialWaitlist }: { initialWaitlist: TWaitlistWithService[] }) {
const  {
    isDeleting,
    handleDelete,
    toast,
    hideToast
} = useWaitlistManager();
    return (
        <div className="space-y-6 relative">
            <Toast toast={toast} onClose={hideToast}/>


            <div
                className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <AnimatePresence mode="popLayout">
                    {initialWaitlist.length === 0 ? (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="p-16 flex flex-col items-center justify-center text-center">
                            <div
                                className="w-20 h-20 bg-beige-light/50 dark:bg-zinc-800/80 rounded-[2rem] flex items-center justify-center mb-6 rotate-3 shadow-inner">
                                <svg className="w-10 h-10 text-graphite/20 dark:text-zinc-600" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif text-graphite dark:text-zinc-200 mb-2">Kolejka jest
                                pusta</h3>
                            <p className="text-sm font-medium text-graphite/50 dark:text-zinc-500 max-w-sm">
                                Brak zgłoszeń. Gdy ktoś zapisze się na listę rezerwową, pojawi się w tym miejscu.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1">
                            {initialWaitlist.map((entry) => (
                                <motion.div
                                    layout
                                    initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, scale: 0.95}}
                                    key={entry.id}
                                    className="group flex flex-col lg:flex-row p-6 lg:items-center gap-6 border-b border-dashed border-beige-dark/20 dark:border-zinc-800/60 last:border-0 hover:bg-beige-light/20 dark:hover:bg-zinc-800/20 transition-colors"
                                >
                                    <div
                                        className="flex lg:flex-col items-center lg:items-start gap-3 lg:gap-1 lg:w-32 shrink-0">
                                        <div
                                            className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-beige-dark/20 dark:border-zinc-700 shadow-sm flex items-center justify-center text-graphite/50 dark:text-zinc-400">
                                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm font-bold text-graphite dark:text-zinc-200">
                                                {new Date(entry.createdAt).toLocaleDateString('pl-PL', {
                                                    day: '2-digit',
                                                    month: '2-digit'
                                                })}
                                            </p>
                                            <p className="text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                                                {new Date(entry.createdAt).toLocaleTimeString('pl-PL', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-serif font-bold text-lg text-graphite dark:text-zinc-100 truncate">{entry.patientName}</h3>
                                            <span
                                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-sage/10 text-sage dark:bg-emerald-900/30 dark:text-emerald-400 border border-sage/20 dark:border-emerald-800 shrink-0">
                                                {entry.service.name}
                                            </span>
                                        </div>
                                        <div
                                            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-graphite/60 dark:text-zinc-400">
                                            <a href={`mailto:${entry.email}`}
                                               className="flex items-center gap-1.5 hover:text-sage transition-colors truncate max-w-[200px]">
                                                <svg className="w-3.5 h-3.5 opacity-70" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                </svg>
                                                {entry.email}
                                            </a>
                                            <span className="hidden sm:inline opacity-30">•</span>
                                            <a href={`tel:${entry.phone}`}
                                               className="flex items-center gap-1.5 hover:text-sage transition-colors">
                                                <svg className="w-3.5 h-3.5 opacity-70" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                                </svg>
                                                {entry.phone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="lg:w-64 xl:w-80 shrink-0">
                                        {entry.notes ? (
                                            <div
                                                className="bg-white/50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-beige-dark/20 dark:border-zinc-800 text-xs text-graphite/70 dark:text-zinc-300 italic relative overflow-hidden">
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 w-1 bg-sage/30 dark:bg-emerald-500/30"/>
                                                &quot;{entry.notes}&quot;
                                            </div>
                                        ) : (
                                            <div
                                                className="text-[10px] font-bold uppercase tracking-widest text-graphite/30 dark:text-zinc-600 flex items-center gap-2">
                                                <div className="w-4 h-px bg-graphite/20 dark:bg-zinc-700"/>
                                                Brak dodatkowych uwag
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className="shrink-0 flex lg:flex-col items-center lg:items-end justify-end border-t lg:border-none border-beige-dark/10 dark:border-zinc-800 pt-4 lg:pt-0">
                                        <button
                                            onClick={() => handleDelete(entry.id, entry.patientName)}
                                            disabled={isDeleting === entry.id}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full lg:w-auto bg-graphite dark:bg-zinc-100 text-white dark:text-graphite text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-sage dark:hover:bg-emerald-400 hover:text-white hover:shadow-lg hover:shadow-sage/20 transition-all outline-none active:scale-95 disabled:opacity-50"
                                        >
                                            {isDeleting === entry.id ? (
                                                <span
                                                    className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                    Zrobione
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
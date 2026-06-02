"use client";

import { getActionBadge } from "@/constants/ActionBadges";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "@/framer-motion/animation-logs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {ISystemLogsViewerProps} from "@/types/logs";

export default function SystemLogsViewer({ logs, currentPage, totalPages, totalCount }: ISystemLogsViewerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className={`bg-white dark:bg-[#262626] border border-beige-dark/20 dark:border-zinc-700 rounded-[24px] shadow-sm transition-all duration-300 overflow-hidden ${isPending ? 'opacity-70 pointer-events-none blur-[1px]' : ''}`}>

                <div className="hidden md:grid md:grid-cols-[160px_260px_150px_1fr] gap-6 px-6 py-4 border-b border-beige-dark/10 dark:border-zinc-800 bg-beige-light/20 dark:bg-zinc-800/30">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">Data i Czas</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">Akcja</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">Adres IP</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">Szczegóły logowania</span>
                </div>

                <motion.div
                    className="divide-y divide-beige-dark/10 dark:divide-zinc-800/80 min-h-[400px]"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode="popLayout">
                        {logs.length === 0 ? (
                            <motion.div variants={itemVariants} className="py-24 flex flex-col items-center justify-center text-center px-4">
                                <div className="w-16 h-16 bg-beige-light/50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-beige-dark/10 dark:border-zinc-700">
                                    <svg className="w-8 h-8 text-graphite/30 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-base font-semibold text-graphite/70 dark:text-zinc-300">Brak logów</p>
                                <p className="text-sm text-graphite/40 dark:text-zinc-500 mt-1 max-w-sm">
                                    System nie zarejestrował jeszcze żadnych zdarzeń na tej stronie.
                                </p>
                            </motion.div>
                        ) : (
                            logs.map((log) => {
                                const dateObj = new Date(log.createdAt);

                                return (
                                    <motion.div
                                        layout
                                        variants={itemVariants}
                                        key={log.id}
                                        className="group flex flex-col md:grid md:grid-cols-[160px_260px_150px_1fr] gap-3 md:gap-6 px-5 sm:px-6 py-5 md:py-4 hover:bg-beige-light/30 dark:hover:bg-zinc-800/40 transition-colors items-start md:items-center"
                                    >
                                        <div className="flex items-center justify-between w-full md:w-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-beige-light dark:bg-zinc-800 flex flex-col items-center justify-center shrink-0 border border-beige-dark/10 dark:border-zinc-700/50 transition-transform group-hover:scale-105 duration-300">
                                                    <span className="text-[9px] font-bold text-graphite/40 dark:text-zinc-500 leading-none uppercase tracking-wider">
                                                        {dateObj.toLocaleString("pl-PL", { month: "short" }).replace(".", "")}
                                                    </span>
                                                    <span className="text-[15px] font-serif font-bold text-graphite dark:text-zinc-200 leading-none mt-0.5">
                                                        {dateObj.getDate()}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-mono font-medium text-graphite/50 dark:text-zinc-500">
                                                    {dateObj.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                                </span>
                                            </div>

                                            <div className="md:hidden origin-right scale-90">
                                                {getActionBadge(log.action)}
                                            </div>
                                        </div>

                                        <div className="hidden md:flex w-full transition-transform group-hover:-translate-y-0.5 duration-300">
                                            {getActionBadge(log.action)}
                                        </div>

                                        <div className="flex flex-col md:justify-center w-full md:w-auto">
                                            <span className="text-[9px] uppercase font-bold text-graphite/40 dark:text-zinc-500 mb-1 md:hidden">Adres IP</span>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3 h-3 text-graphite/30 dark:text-zinc-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                                <p className="text-[13px] font-mono font-medium text-graphite/70 dark:text-zinc-400">
                                                    {log.ipAddress || "Ukryte / Brak"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center w-full min-w-0 bg-beige-light/30 md:bg-transparent dark:bg-zinc-800/30 md:dark:bg-transparent p-2.5 md:p-0 rounded-lg mt-1 md:mt-0">
                                            <span className="text-[9px] uppercase font-bold text-graphite/40 dark:text-zinc-500 mb-1 md:hidden">Szczegóły</span>
                                            <p className="text-[12px] font-mono text-graphite/60 dark:text-zinc-500 truncate w-full">
                                                {log.details || "—"}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
                    <p className="text-xs font-medium text-graphite/50 dark:text-zinc-500 order-2 sm:order-1">
                        Wyświetlanie strony <strong className="text-graphite dark:text-zinc-200">{currentPage}</strong> z {totalPages} <span className="mx-1.5 opacity-50">|</span> Razem: {totalCount} logów
                    </p>

                    <div className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-beige-dark/20 dark:border-zinc-700 shadow-sm order-1 sm:order-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isPending}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-beige-light/50 dark:hover:bg-zinc-800 text-graphite dark:text-zinc-300 flex items-center gap-1.5 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            Poprzednia
                        </button>

                        <div className="w-px h-5 bg-beige-dark/30 dark:bg-zinc-700 mx-1" />

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isPending}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-beige-light/50 dark:hover:bg-zinc-800 text-graphite dark:text-zinc-300 flex items-center gap-1.5 active:scale-95"
                        >
                            Następna
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
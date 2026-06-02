"use client";

import React from "react";
import { useBlockedTimeManager } from "@/hooks/useBlockedTimeManager";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function BlockedTimeManager() {
    const {
        blockedTimes, isLoading, isSubmitting, date, setDate, startTime, setStartTime,
        endTime, setEndTime, reason, setReason, handleAddBlock, handleDelete, hideToast, toast
    } = useBlockedTimeManager();

    return (
        <>
            <Toast toast={toast} onClose={hideToast} />
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-red-200/50 dark:border-red-900/30 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">

            <div className="mb-8 border-b border-red-100 dark:border-red-900/30 pb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                    <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 tracking-tight">Wyjątki i Urlopy</h2>
                    <p className="text-sm text-graphite/60 dark:text-zinc-400 mt-1 font-medium">Zablokuj wybrane dni lub godziny, aby pacjenci nie mogli się zapisać.</p>
                </div>
            </div>

            <form onSubmit={handleAddBlock} className="flex flex-col lg:flex-row gap-4 mb-8 bg-red-50/50 dark:bg-red-950/10 p-5 rounded-2xl border border-red-100/50 dark:border-red-900/30">
                <div className="flex-1 relative">
                    <label className="absolute -top-2.5 left-3 bg-red-50 dark:bg-[#2b1f1f] px-1 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 z-10">Dzień urlopu</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-red-200/50 dark:border-red-900/50 rounded-xl text-sm font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-red-400 outline-none transition-all"/>
                </div>

                <div className="flex gap-4 lg:w-64 shrink-0">
                    <div className="flex-1 relative">
                        <label className="absolute -top-2.5 left-3 bg-red-50 dark:bg-[#2b1f1f] px-1 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 z-10">Od</label>
                        <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-red-200/50 dark:border-red-900/50 rounded-xl text-sm font-mono font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-red-400 outline-none transition-all"/>
                    </div>
                    <div className="flex-1 relative">
                        <label className="absolute -top-2.5 left-3 bg-red-50 dark:bg-[#2b1f1f] px-1 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 z-10">Do</label>
                        <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-red-200/50 dark:border-red-900/50 rounded-xl text-sm font-mono font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-red-400 outline-none transition-all"/>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <label className="absolute -top-2.5 left-3 bg-red-50 dark:bg-[#2b1f1f] px-1 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 z-10">Notatka dla Ciebie (opcjonalnie) </label>
                    <input type="text" placeholder="np. Wyjazd na narty" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-red-200/50 dark:border-red-900/50 rounded-xl text-sm font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-red-400 outline-none transition-all"/>
                </div>

                <div className="shrink-0 flex items-end">
                    <button type="submit" disabled={isSubmitting} className="w-full lg:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-[0_8px_15px_rgb(220,38,38,0.2)] hover:bg-red-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                        {isSubmitting ? "Blokowanie..." : "Zablokuj w kalendarzu"}
                    </button>
                </div>
            </form>

            <div className="space-y-3 relative">
                {isLoading && <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center"><span className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"/></div>}

                <AnimatePresence mode="popLayout">
                    {blockedTimes.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center bg-white/50 dark:bg-zinc-900/50 border border-dashed border-red-200 dark:border-red-900/50 rounded-2xl">
                            <span className="block text-sm font-bold text-graphite/40 dark:text-zinc-500">Brak zaplanowanych urlopów na przyszłość.</span>
                        </motion.div>
                    ) : (
                        blockedTimes.map(block => (
                            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={block.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-zinc-800/80 border border-beige-dark/20 dark:border-zinc-700 rounded-2xl shadow-sm hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{new Date(block.startDate).toLocaleString('pl-PL', { month: 'short' })}</span>
                                        <span className="text-lg font-serif leading-none font-bold">{new Date(block.startDate).getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="font-mono font-bold text-graphite dark:text-zinc-200 text-sm flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 text-graphite/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            {new Date(block.startDate).toLocaleTimeString("pl-PL", { hour: '2-digit', minute: '2-digit' })}
                                            <span className="text-graphite/30">-</span>
                                            {new Date(block.endDate).toLocaleTimeString("pl-PL", { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {block.reason && <p className="text-xs font-medium text-graphite/60 dark:text-zinc-400 mt-1 uppercase tracking-widest">{block.reason}</p>}
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 flex justify-end">
                                    <button onClick={() => handleDelete(block.id)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 outline-none active:scale-95">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        Odblokuj termin
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
            </>
    );
}
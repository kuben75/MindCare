"use client";

import { WeeklySchedule } from "@prisma/client";
import { DAYS_NAMES } from "@/constants/calendar";
import { useScheduleForm } from "@/hooks/useScheduleForm";
import { motion } from "framer-motion";
import {Toast} from "@/components/ui/Toast";
import React from "react";
import {containerVariants, itemVariants} from "@/framer-motion/animation-logs";
import InfoTooltip from "@/components/ui/InfoTooltip";

export default function ScheduleForm({ initialSchedules }: { initialSchedules: WeeklySchedule[] }) {
    const { schedules, isLoading, handleToggleDay, handleTimeChange, handleSave, toast, hideToast } = useScheduleForm({ initialSchedules });

    return (
        <>
            <Toast toast={toast} onClose={hideToast} />
        <motion.div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10" variants={containerVariants} initial="hidden" animate="visible">

            <motion.div className="relative z-20 mb-8 border-b border-beige-dark/20 dark:border-zinc-800 pb-4" variants={itemVariants}>
                <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 tracking-tight">Stały tydzień pracy</h2>
                    </div>
                </h2>
                <div className="flex items-center gap-1 justify-between">
                <p className="text-sm text-graphite/60 dark:text-zinc-400 mt-2 font-medium">Ustal w jakich godzinach jesteś dostępna dla pacjentów w poszczególne dni.</p>
                    <InfoTooltip
                        title="Czas obowiązujący w gabinecie"
                        description="Twój grafik jest synchronizowany w czasie polskim (Europe/Warsaw). Niezależnie od Twojej bieżącej lokalizacji, ustawiaj godziny zgodnie z czasem obowiązującym w Polsce."
                    />
                </div>
            </motion.div>

            <motion.div className="relative z-10 space-y-4" variants={itemVariants}>
                {schedules.map((schedule) => (
                    <motion.div
                        key={schedule.dayOfWeek}
                        layout
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                            schedule.isActive
                                ? "bg-white dark:bg-zinc-800/80 border-beige-dark/30 dark:border-zinc-700 shadow-sm"
                                : "bg-beige-light/10 dark:bg-zinc-900/30 border-dashed border-beige-dark/20 dark:border-zinc-800 opacity-60"
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <button
                                type="button"
                                onClick={() => handleToggleDay(schedule.dayOfWeek)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${schedule.isActive ? 'bg-sage dark:bg-emerald-500' : 'bg-graphite/20 dark:bg-zinc-700'}`}
                            >
                                <motion.div
                                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                                    animate={{ x: schedule.isActive ? 24 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                            <span className={`font-bold uppercase tracking-widest text-sm w-28 ${schedule.isActive ? 'text-graphite dark:text-zinc-200' : 'text-graphite/40 dark:text-zinc-600'}`}>
                                {DAYS_NAMES[schedule.dayOfWeek]}
                            </span>
                        </div>

                        <div className={`flex items-center gap-3 w-full sm:w-auto transition-opacity ${schedule.isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div className="relative group flex-1 sm:flex-none">
                                <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-800 px-1 text-[9px] font-bold uppercase tracking-widest text-sage dark:text-emerald-400 z-10">Od</label>
                                <input
                                    type="time" disabled={!schedule.isActive} value={schedule.startTime} onChange={(e) => handleTimeChange(schedule.dayOfWeek, 'startTime', e.target.value)}
                                    className="w-full sm:w-32 px-4 py-3 bg-transparent border border-beige-dark/30 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none transition-all"
                                />
                            </div>
                            <span className="text-graphite/30 dark:text-zinc-600 font-bold">-</span>
                            <div className="relative group flex-1 sm:flex-none">
                                <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-800 px-1 text-[9px] font-bold uppercase tracking-widest text-sage dark:text-emerald-400 z-10">Do</label>
                                <input
                                    type="time" disabled={!schedule.isActive} value={schedule.endTime} onChange={(e) => handleTimeChange(schedule.dayOfWeek, 'endTime', e.target.value)}
                                    className="w-full sm:w-32 px-4 py-3 bg-transparent border border-beige-dark/30 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none transition-all"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite font-bold rounded-xl shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? (
                        <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white dark:border-graphite/30 dark:border-t-graphite rounded-full" /> Zapisywanie...</>
                    ) : "Zapisz harmonogram"}
                </button>
            </div>
        </motion.div>
        </>
    );

}
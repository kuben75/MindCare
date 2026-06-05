import {ICalendarHeaderProps, TViewType} from "@/types/calendar";
import {motion} from "framer-motion";
import {VIEW_LABELS} from "@/constants/calendar";
import React from "react";


export const CalendarHeader = ({ handleToday, handleNavigate, formatHeaderDate, view, setView }: ICalendarHeaderProps) => (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
            <button
                onClick={handleToday}
                className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-beige-dark/40 dark:border-zinc-700 rounded-2xl text-sm font-bold text-graphite dark:text-zinc-200 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_15px_rgb(0,0,0,0.05)] hover:-translate-y-0.5 transition-all active:scale-95"
            >
                Dziś
            </button>
            <div className="flex items-center bg-white dark:bg-zinc-800 border border-beige-dark/40 dark:border-zinc-700 rounded-2xl p-1 shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                <button onClick={() => handleNavigate('prev')} className="p-2 rounded-xl hover:bg-beige-light/50 dark:hover:bg-zinc-700 text-graphite/60 dark:text-zinc-400 hover:text-graphite dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-px h-5 bg-beige-dark/30 dark:bg-zinc-700 mx-1" />
                <button onClick={() => handleNavigate('next')} className="p-2 rounded-xl hover:bg-beige-light/50 dark:hover:bg-zinc-700 text-graphite/60 dark:text-zinc-400 hover:text-graphite dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <h2 className="text-2xl font-serif text-graphite dark:text-white capitalize ml-2 tracking-tight">
                {formatHeaderDate()}
            </h2>
        </div>


        <div className="flex p-1.5 bg-beige-dark/10 dark:bg-zinc-900 rounded-2xl w-full xl:w-auto relative">
            {(['day', 'week', 'month'] as TViewType[]).map((v) => (
                <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`relative flex-1 xl:flex-none px-8 py-2.5 text-sm font-bold rounded-xl transition-colors z-10 outline-none ${
                        view === v ? 'text-graphite dark:text-white' : 'text-graphite/50 dark:text-zinc-500 hover:text-graphite dark:hover:text-zinc-300'
                    }`}
                >
                    {view === v && (
                        <motion.div
                            layoutId="active-view-pill"
                            className="absolute inset-0 bg-white dark:bg-zinc-700 shadow-[0_2px_8px_rgb(0,0,0,0.08)] rounded-xl -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    )}
                    {VIEW_LABELS[v]}
                </button>
            ))}
        </div>
    </div>
);

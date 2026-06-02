import {HOURS, STATUS_STYLES, WEEKDAYS} from "@/constants/calendar";
import {motion} from "framer-motion";
import {ReservationStatus} from "@prisma/client";
import React from "react";

export const WeekViewDesktop = ({ currentDate, getDaysOfWeek, visibleReservations, setSelectedRes }: any) => (
    <div className="hidden lg:block bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

        <div className="grid grid-cols-8 border-b border-beige-dark/20 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
            <div className="border-r border-beige-dark/10 dark:border-zinc-800/50"></div>
            {getDaysOfWeek(currentDate).map((day: Date, idx: number) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                    <div key={idx} className={`p-4 text-center border-r border-beige-dark/10 dark:border-zinc-800/50 last:border-0 relative ${isToday ? 'bg-sage/5 dark:bg-emerald-900/10' : ''}`}>
                        {isToday && <div className="absolute top-0 inset-x-0 h-1 bg-sage dark:bg-emerald-500 rounded-b-full" />}
                        <div className={`uppercase font-bold tracking-widest text-[10px] ${isToday ? 'text-sage dark:text-emerald-400' : 'text-graphite/40 dark:text-zinc-500'}`}>{WEEKDAYS[idx]}</div>
                        <div className={`text-2xl font-serif mt-1 ${isToday ? 'text-sage dark:text-emerald-400' : 'text-graphite dark:text-zinc-200'}`}>{day.getDate()}</div>
                    </div>
                )
            })}
        </div>

        <div className="relative">
            {HOURS.map((hour, i) => (
                <div key={hour} className="grid grid-cols-8 min-h-[90px] border-b border-dashed border-beige-dark/20 dark:border-zinc-800/50 last:border-0">
                    <div className="font-mono text-xs font-bold text-graphite/30 dark:text-zinc-600 text-center pt-2 border-r border-beige-dark/10 dark:border-zinc-800/50">
                        {hour}
                    </div>
                    {getDaysOfWeek(currentDate).map((day: Date, idx: number) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        const match = visibleReservations.find((res: any) => new Date(res.date).toDateString() === day.toDateString() && `${String(new Date(res.date).getHours()).padStart(2, '0')}:00` === hour);
                        return (
                            <div key={idx} className={`border-r border-beige-dark/10 dark:border-zinc-800/50 last:border-0 relative ${isToday ? 'bg-sage/[0.02] dark:bg-emerald-900/[0.02]' : ''}`}>
                                {match && (
                                    <motion.div
                                        onClick={() => setSelectedRes(match)}
                                        whileHover={{ scale: 1.03, zIndex: 20 }}
                                        className={`absolute inset-1.5 p-3 rounded-2xl border ${STATUS_STYLES[match.status as ReservationStatus].bg} ${STATUS_STYLES[match.status as ReservationStatus].border} cursor-pointer shadow-sm flex flex-col justify-between overflow-hidden`}
                                    >
                                        <div className={`font-bold text-xs truncate ${STATUS_STYLES[match.status as ReservationStatus].text}`}>{match.patientName}</div>
                                        <div className={`font-medium text-[10px] opacity-70 truncate mt-1 ${STATUS_STYLES[match.status as ReservationStatus].text}`}>{match.service.name}</div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    </div>
);
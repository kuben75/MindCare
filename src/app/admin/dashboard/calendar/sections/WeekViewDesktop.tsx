import {STATUS_STYLES, WEEKDAYS} from "@/constants/calendar";
import {adminToday, calendarHours, formatFloatingTime, formatHour, isSameFloatingDay} from "@/hooks/useAdminCalendarLogic";
import {motion} from "framer-motion";
import {ReservationStatus} from "@prisma/client";
import React from "react";
import {IWeekViewDesktopProps} from "@/types/dashboard";
import {TCalendarReservation} from "@/types/calendar";


export const WeekViewDesktop = ({ currentDate, getDaysOfWeek, visibleReservations, setSelectedRes }: IWeekViewDesktopProps) => {
    const today = adminToday();
    const days = getDaysOfWeek(currentDate);
    return (
    <div className="hidden lg:block bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

        <div className="grid grid-cols-8 border-b border-beige-dark/20 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
            <div className="border-r border-beige-dark/10 dark:border-zinc-800/50"></div>
            {days.map((day: Date, idx: number) => {
                const isToday = isSameFloatingDay(day, today);
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
            {calendarHours(visibleReservations).map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[90px] border-b border-dashed border-beige-dark/20 dark:border-zinc-800/50 last:border-0">
                    <div className="font-mono text-xs font-bold text-graphite/30 dark:text-zinc-600 text-center pt-2 border-r border-beige-dark/10 dark:border-zinc-800/50">
                        {formatHour(hour)}
                    </div>
                    {days.map((day: Date, idx: number) => {
                        const isToday = isSameFloatingDay(day, today);
                        const matches = visibleReservations.filter((res: TCalendarReservation) => isSameFloatingDay(res.displayDate, day) && res.displayDate.getHours() === hour);
                        return (
                            <div key={idx} className={`border-r border-beige-dark/10 dark:border-zinc-800/50 last:border-0 relative ${isToday ? 'bg-sage/[0.02] dark:bg-emerald-900/[0.02]' : ''}`}>
                                {matches.length > 0 && <div className="absolute inset-1.5 flex flex-col gap-1">{matches.map((match) => (
                                    <motion.div
                                        key={match.id}
                                        onClick={() => setSelectedRes(match)}
                                        whileHover={{ scale: 1.03, zIndex: 20 }}
                                        className={`flex-1 min-h-0 p-3 rounded-2xl border ${STATUS_STYLES[match.status as ReservationStatus].bg} ${STATUS_STYLES[match.status as ReservationStatus].border} cursor-pointer shadow-sm flex flex-col justify-between overflow-hidden`}
                                    >
                                        <div className={`font-bold text-xs truncate ${STATUS_STYLES[match.status as ReservationStatus].text}`}>{formatFloatingTime(match.displayDate)} {match.patientName}</div>
                                        <div className={`font-medium text-[10px] opacity-70 truncate mt-1 ${STATUS_STYLES[match.status as ReservationStatus].text}`}>{match.service.name}</div>
                                    </motion.div>
                                ))}</div>}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    </div>
    );
};
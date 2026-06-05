import {motion} from "framer-motion";
import {STATUS_STYLES, WEEKDAYS} from "@/constants/calendar";
import {ReservationStatus} from "@prisma/client";
import React from "react";
import {TReservationWithService} from "@/types/reservation";
import {IWeekViewMobileProps} from "@/types/calendar";

export const WeekViewMobile = ({ currentDate, getDaysOfWeek, visibleReservations, setSelectedRes }: IWeekViewMobileProps) => {
    const days = getDaysOfWeek(currentDate);
    return (
        <div className="lg:hidden space-y-6">
            {days.map((day: Date, idx: number) => {
                const dayReservations = visibleReservations.filter((res: TReservationWithService) => new Date(res.date).toDateString() === day.toDateString());
                const isToday = day.toDateString() === new Date().toDateString();
                if (dayReservations.length === 0 && !isToday) return null;

                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`rounded-3xl border overflow-hidden shadow-sm ${isToday ? 'bg-sage/5 border-sage/20 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-white border-beige-dark/20 dark:bg-[#262626] dark:border-zinc-800'}`}>
                        <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className="font-serif text-3xl text-graphite dark:text-zinc-100">{day.getDate()}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">{WEEKDAYS[idx]}</span>
                            </div>
                            {isToday && <span className="text-[10px] font-bold uppercase tracking-widest bg-sage text-white px-3 py-1.5 rounded-full shadow-md shadow-sage/30">Dzisiaj</span>}
                        </div>

                        <div className="p-3 space-y-2">
                            {dayReservations.length === 0 ? (
                                <p className="text-sm font-medium text-graphite/30 dark:text-zinc-600 text-center py-6">Masz wolne</p>
                            ) : (
                                dayReservations.map((res: TReservationWithService) => (
                                    <div key={res.id} onClick={() => setSelectedRes(res)} className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-95 transition-transform ${STATUS_STYLES[res.status as ReservationStatus].bg} ${STATUS_STYLES[res.status as ReservationStatus].border}`}>
                                        <div>
                                            <div className={`font-bold text-sm ${STATUS_STYLES[res.status as ReservationStatus].text}`}>{res.patientName}</div>
                                            <div className={`text-xs font-medium mt-1 opacity-70 ${STATUS_STYLES[res.status as ReservationStatus].text}`}>{res.service.name}</div>
                                        </div>
                                        <div className={`font-mono font-bold text-sm px-3 py-1.5 rounded-xl bg-white/50 dark:bg-black/20 ${STATUS_STYLES[res.status as ReservationStatus].text}`}>
                                            {new Date(res.date).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    )
};
import {STATUS_STYLES, WEEKDAYS} from "@/constants/calendar";
import {ReservationStatus} from "@prisma/client";
import React from "react";
import {IMonthViewProps} from "@/types/calendar";

export const MonthView = ({ getDaysInMonth, currentDate, visibleReservations, setSelectedRes, setCurrentDate, setView }: IMonthViewProps) => (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-2 sm:p-4">
        <div className="grid grid-cols-7 text-center pb-2 pt-2 text-[10px] sm:text-xs font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest">
            {WEEKDAYS.map(w => <div key={w} className="hidden sm:block">{w}</div>)}
            {WEEKDAYS.map(w => <div key={w + 'mob'} className="sm:hidden">{w.slice(0, 3)}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {getDaysInMonth(currentDate).map((cell: any, idx: number) => {
                const cellReservations = visibleReservations.filter((res: any) => new Date(res.date).toDateString() === cell.date.toDateString());
                const isToday = cell.date.toDateString() === new Date().toDateString();

                return (
                    <div key={idx} className={`min-h-[90px] sm:min-h-[130px] p-2 rounded-2xl flex flex-col transition-all ${!cell.isCurrentMonth ? 'opacity-30 pointer-events-none' : 'bg-white dark:bg-[#262626] border border-beige-dark/10 dark:border-zinc-800 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-sage text-white shadow-md shadow-sage/30' : 'text-graphite dark:text-zinc-300'}`}>
                                {cell.date.getDate()}
                            </span>
                        </div>

                        <div className="hidden sm:flex flex-col gap-1.5 flex-1 overflow-hidden">
                            {cellReservations.slice(0, 3).map((res: any) => (
                                <div key={res.id} onClick={() => setSelectedRes(res)} className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer hover:-translate-y-px transition-transform truncate ${STATUS_STYLES[res.status as ReservationStatus].bg} ${STATUS_STYLES[res.status as ReservationStatus].border} ${STATUS_STYLES[res.status as ReservationStatus].text}`}>
                                    {new Date(res.date).getHours()}:00 {res.patientName.split(' ')[0]}
                                </div>
                            ))}
                            {cellReservations.length > 3 && (
                                <button onClick={() => { setCurrentDate(cell.date); setView('day'); }} className="text-[10px] font-bold text-sage dark:text-emerald-400 hover:bg-sage/10 py-1 rounded-lg mt-auto transition-colors">
                                    +{cellReservations.length - 3}
                                </button>
                            )}
                        </div>

                        <div className="sm:hidden flex flex-wrap gap-1 mt-auto">
                            {cellReservations.map((res: any) => (
                                <div key={res.id} onClick={() => { setCurrentDate(cell.date); setView('day'); }} className={`w-2 h-2 rounded-full ${STATUS_STYLES[res.status as ReservationStatus].dot}`} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);
import React from "react";
import {TReservationWithService} from "@/types/reservation";

export const AgendaCard = ({ appointment }: { appointment: TReservationWithService }) => {
    const time = new Date(appointment.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const isCompleted = appointment.status === 'COMPLETED';

    return (
        <div className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
            isCompleted
                ? 'bg-beige-light/10 border-transparent opacity-60 dark:bg-zinc-900/30'
                : 'bg-white border-beige-dark/20 dark:bg-zinc-800/40 dark:border-zinc-700/50 hover:shadow-lg hover:shadow-sage/5 hover:border-sage/30'
        }`}>
            <div className="sm:w-20 shrink-0 border-l-4 sm:border-l-0 sm:border-r-2 pl-3 sm:pl-0 sm:pr-4 border-sage/20 dark:border-emerald-500/20 text-left sm:text-right">
                <span className={`text-xl font-bold tracking-tight ${isCompleted ? 'text-graphite/40 dark:text-zinc-500' : 'text-sage dark:text-emerald-400'}`}>
                    {time}
                </span>
            </div>

            <div className="flex-1 min-w-0 pl-1 sm:pl-0">
                <p className="font-bold text-graphite dark:text-zinc-100 truncate text-base mb-0.5 group-hover:text-sage dark:group-hover:text-emerald-400 transition-colors">
                    {appointment.patientName}
                </p>
                <div className="flex items-center gap-2 text-sm text-graphite/60 dark:text-zinc-400 truncate">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    <span className="truncate">{appointment.service.name}</span>
                </div>
            </div>

            <div className="shrink-0 flex flex-wrap gap-2 mt-2 sm:mt-0">
                {appointment.status === 'PAID' && <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400">Opłacona</span>}
                {appointment.status === 'PENDING' && <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Brak wpłaty</span>}
                {isCompleted && <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">Zakończona</span>}

                {appointment.rescheduleRequested && (
                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 animate-pulse shadow-sm">Zmiana</span>
                )}
            </div>
        </div>
    );
};
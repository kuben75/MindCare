import { STATUS_BADGE } from "@/constants/ActionBadges";
import { ReservationStatus } from "@prisma/client";
import ReservationActionMenu from "@/app/admin/dashboard/reservations/ReservationActionMenu";
import React from "react";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { IReservationCardProps } from "@/types/reservation";

export const ReservationCard = ({ reservation, isExpanded, onToggleDrawer }: IReservationCardProps) => {
    const isCompleted = reservation.status === 'COMPLETED';
    const style = STATUS_BADGE[reservation.status as ReservationStatus];

    const dateObj = new Date(reservation.date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('pl-PL', { month: 'short' }).replace('.', '');
    const weekday = dateObj.toLocaleString('pl-PL', { weekday: 'long' });
    const time = dateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`group flex flex-col p-4 sm:p-5 bg-white dark:bg-[#262626] border transition-all duration-300 ${
            isExpanded
                ? 'border-sage/40 dark:border-emerald-500/40 shadow-md ring-1 ring-sage/20 rounded-t-2xl sm:rounded-t-3xl'
                : 'border-beige-dark/20 dark:border-zinc-700/80 rounded-2xl sm:rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-sage/30'
        } ${isCompleted && !isExpanded ? 'opacity-75 hover:opacity-100' : ''}`}>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-5 lg:gap-8">

                <div className="flex items-center gap-3.5 sm:gap-4 lg:w-56 shrink-0">
                    <div className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border shadow-sm ${style.bg} ${style.border} shrink-0`}>
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${style.text} opacity-80 mb-0.5`}>
                            {month}
                        </span>
                        <span className={`text-lg sm:text-xl font-serif leading-none ${style.text}`}>
                            {day}
                        </span>
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-graphite/40 dark:text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span className="font-mono font-bold text-graphite dark:text-zinc-200 text-xs sm:text-sm tracking-tight">{time}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-graphite/50 dark:text-zinc-400 capitalize tracking-wide mt-0.5 truncate">
                            {weekday}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-w-0 border-t border-b lg:border-none border-beige-dark/10 dark:border-zinc-800 py-3 lg:py-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-graphite dark:text-zinc-100 truncate max-w-full">
                            {reservation.patientName}
                        </h3>
                        {reservation.rescheduleRequested && (
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 shadow-sm">
                                    Prośba o zmianę
                                </span>
                                <InfoTooltip
                                    title="Pacjent prosi o nowy termin"
                                    description="Pacjent kliknął link w swoim mailu z potwierdzeniem, prosząc o przełożenie wizyty. Użyj menu akcji po prawej stronie i wybierz 'Przełóż wizytę'."
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-graphite/60 dark:text-zinc-400">
                        <a href={`mailto:${reservation.email}`} className="flex items-center gap-1.5 hover:text-sage transition-colors truncate max-w-[220px] sm:max-w-xs">
                            <svg className="w-3.5 h-3.5 opacity-70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <span className="truncate">{reservation.email}</span>
                        </a>
                        <span className="opacity-30 hidden sm:inline">•</span>
                        <a href={`tel:${reservation.phone}`} className="flex items-center gap-1.5 hover:text-sage transition-colors shrink-0">
                            <svg className="w-3.5 h-3.5 opacity-70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            {reservation.phone}
                        </a>
                    </div>
                </div>

                <div className="flex items-center justify-between lg:w-64 shrink-0 bg-beige-light/30 dark:bg-zinc-800/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-beige-dark/20 dark:border-zinc-700/50">
                    <div className="flex flex-col gap-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-graphite dark:text-zinc-300 truncate" title={reservation.service.name}>
                            {reservation.service.name}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shadow-sm shrink-0 ${style.dot}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${style.text}`}>{style.label}</span>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <ReservationActionMenu reservationId={reservation.id} currentStatus={reservation.status}/>
                    </div>
                </div>
            </div>

            <button
                onClick={onToggleDrawer}
                className={`mt-4 sm:mt-5 w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all outline-none ${
                    isExpanded
                        ? 'bg-sage text-white shadow-[0_4px_15px_rgb(164,185,160,0.4)]'
                        : reservation.privateNotes
                            ? 'bg-sage/10 text-sage hover:bg-sage/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                            : 'bg-beige-light/50 text-graphite/50 hover:bg-beige-dark/20 hover:text-graphite dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
                }`}
            >
                {reservation.privateNotes && !isExpanded && (
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                )}
                <span className="truncate">{isExpanded ? 'Zamknij panel' : 'Karta Pacjenta (Notatki / E-mail)'}</span>
            </button>
        </div>
    );
};
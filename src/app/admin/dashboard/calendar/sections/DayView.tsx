import {HOURS, STATUS_STYLES} from "@/constants/calendar";
import React from "react";
import {ReservationStatus} from "@prisma/client";
import {motion} from "framer-motion";
import {TReservationWithService} from "@/types/reservation";
import {IDayViewProps, IEventCardProps} from "@/types/calendar";


export const DayView = ({ visibleReservations, setSelectedRes }: IDayViewProps) => (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative">
            {HOURS.map((hour, i) => {
                const match = visibleReservations.find((res: TReservationWithService) => `${String(new Date(res.date).getHours()).padStart(2, '0')}:00` === hour);
                return (
                    <div key={hour} className="flex min-h-[90px] relative group">

                        <div className="w-16 sm:w-20 font-mono text-xs sm:text-sm font-bold text-graphite/30 dark:text-zinc-600 text-right pr-4 sm:pr-6 -mt-2.5">
                            {hour}
                        </div>

                        <div className="flex-1 border-t border-dashed border-beige-dark/30 dark:border-zinc-700/50 relative">
                            {match && <EventCard match={match} onClick={() => setSelectedRes(match)} />}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);


const EventCard = ({ match, onClick }: IEventCardProps ) => {
    const style = STATUS_STYLES[match.status as ReservationStatus];
    return (
        <motion.div
            layoutId={`event-${match.id}`}
            onClick={onClick}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`absolute inset-x-2 sm:inset-x-4 top-1 bottom-1 p-3 sm:p-4 rounded-2xl border ${style.bg} ${style.border} cursor-pointer shadow-sm hover:shadow-md transition-shadow group overflow-hidden`}
        >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-current opacity-20" />
            <div className="flex justify-between items-start relative z-10">
                <div className={`font-bold text-sm sm:text-base tracking-tight ${style.text} truncate pr-4`}>
                    {match.patientName}
                </div>
                <div className="flex items-center gap-2">
                    {match.privateNotes && <svg className={`w-4 h-4 ${style.text} opacity-60`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>}
                </div>
            </div>
            <div className={`text-xs font-semibold mt-1 opacity-70 ${style.text} truncate`}>
                {match.service.name} <span className="opacity-50 mx-1">•</span> {match.service.duration} min
            </div>
        </motion.div>
    );
};
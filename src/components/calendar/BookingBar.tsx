"use client";

import {formatDateShort} from "@/utils/calendar-utils";
import {useRouter} from "next/navigation";
import {IBookingBarProps} from "@/types/calendar";

export default function BookingBar({ selectedSlot }: IBookingBarProps) {
    const router = useRouter();

    const handleProceed = () => {
        if (!selectedSlot) return;
        router.push(`/reservation?date=${selectedSlot.date.toISOString()}&time=${selectedSlot.time}`);
    };

    return (
        <div className={`
            absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-sage/20 p-5 md:p-6 transition-all duration-500 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]
            ${selectedSlot ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
        `}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
                <div className="text-center md:text-left flex items-center gap-4">
                    <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-graphite/50 uppercase tracking-wider font-semibold">Podsumowanie</p>
                        <p className="text-lg text-graphite font-medium">
                            {selectedSlot && `${formatDateShort(selectedSlot.date)}, godz. `}
                            <span className="text-sage font-bold text-xl">{selectedSlot?.time}</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleProceed}
                    className="w-full md:w-auto px-10 py-3.5 bg-sage text-white rounded-xl font-semibold shadow-lg hover:bg-opacity-90 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    Przejdź do rezerwacji
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </div>
        </div>
    );
}
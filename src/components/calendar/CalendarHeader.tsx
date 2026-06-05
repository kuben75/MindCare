"use client";

import {useState} from "react";
import {IPublicCalendarHeaderProps} from "@/types/calendar";
import {MINI_CAL_DAYS, POLISH_MONTHS} from "@/constants/calendar";
import {usePublicCalendarHeader} from "@/hooks/usePublicCalendarHeader";

export default function CalendarHeader({ startDate, today, maxDate, handleMove, jumpToDate }: IPublicCalendarHeaderProps) {
const {
    isMiniCalOpen,
    setIsMiniCalOpen,
    miniCalMonth,
    setMiniCalMonth,
    isPrevDisabled,
    isNextDisabled,
    daysInMonth,
    emptyDaysCount,
    handleMiniCalPrev,
    handleMiniCalNext,
    handleSelectDate
} = usePublicCalendarHeader({ startDate, today, maxDate, jumpToDate });
    return (
        <div className="bg-white border-b border-beige-dark/10 p-5 lg:p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
            <h3 className="text-2xl font-serif text-graphite capitalize">
                {POLISH_MONTHS[startDate.getMonth()]} {startDate.getFullYear()}
            </h3>

            <div className="flex items-center gap-4 relative">
                <div className="relative">
                    <button
                        onClick={() => setIsMiniCalOpen(!isMiniCalOpen)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all z-20 relative
                            ${isMiniCalOpen ? "bg-sage text-white shadow-md ring-2 ring-sage/20 ring-offset-1" : "bg-beige-light/50 text-graphite hover:bg-beige-light"}
                        `}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="hidden sm:inline">Konkretna data</span>
                        <span className="sm:hidden">Data</span>
                    </button>

                    {isMiniCalOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setIsMiniCalOpen(false)}></div>
                            <div className="absolute top-full mt-3 left-0 md:left-auto md:right-0 w-[320px] bg-white rounded-2xl shadow-2xl border border-beige-dark/20 z-40 p-5 animate-fadeIn">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={handleMiniCalPrev} className="p-1.5 hover:bg-beige-light rounded-lg text-graphite transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <span className="font-serif font-medium text-graphite capitalize text-lg">
                                        {POLISH_MONTHS[miniCalMonth.getMonth()]} {miniCalMonth.getFullYear()}
                                    </span>
                                    <button onClick={handleMiniCalNext} className="p-1.5 hover:bg-beige-light rounded-lg text-graphite transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                    {MINI_CAL_DAYS.map(day => <span key={day} className="text-[11px] font-bold text-graphite/40 uppercase tracking-wider">{day}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {Array.from({ length: emptyDaysCount }).map((_, i) => <div key={`empty-${i}`} className="h-10"></div>)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const cellDate = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth(), day);
                                        const isToday = day === today.getDate() && miniCalMonth.getMonth() === today.getMonth() && miniCalMonth.getFullYear() === today.getFullYear();
                                        const isLocked = cellDate < today || cellDate > maxDate;

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => handleSelectDate(day)}
                                                disabled={isLocked}
                                                className={`
                                                    w-10 h-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all
                                                    ${isLocked ? "text-gray-300 cursor-not-allowed" : "text-graphite hover:bg-sage/10 hover:text-sage"}
                                                    ${isToday && !isLocked ? "border-2 border-sage text-sage" : ""}
                                                `}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-4 border-t border-beige-dark/10 text-center text-xs text-graphite/50">
                                    Rezerwacje możliwe tylko z 30-dniowym wyprzedzeniem.
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-2 relative z-10 bg-beige-light/30 p-1 rounded-xl">
                    <button onClick={() => handleMove(-1)} disabled={isPrevDisabled} className="p-2.5 bg-white rounded-lg hover:bg-beige-light text-graphite active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => handleMove(1)} disabled={isNextDisabled} className="p-2.5 bg-white rounded-lg hover:bg-beige-light text-graphite active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
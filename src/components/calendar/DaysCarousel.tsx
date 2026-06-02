"use client";

import React from "react";
import { formatDateShort } from "@/utils/calendar-utils";
import {IDaysCarouselProps} from "@/types/calendar";
import { POLISH_DAYS_SHORT } from "@/constants/calendar";



export default function DaysCarousel({ calendarData, selectedSlot, setSelectedSlot, today, carouselRef, onScroll }: IDaysCarouselProps) {
    return (
        <div
            ref={carouselRef}
            onScroll={onScroll}
            className="w-full overflow-x-auto flex snap-x snap-mandatory touch-pan-x bg-[#faf9f7] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
        >
            <div className="flex divide-x divide-beige-dark/10">
                {calendarData.map((day) => {
                    const isDayPast = day.date < today;
                    const dateId = `day-${day.date.getTime()}`;

                    return (
                        <div key={dateId} id={dateId} className="flex-none w-[33.333vw] md:w-[16.666vw] max-w-[calc(1152px/3)] md:max-w-[calc(1152px/6)] flex flex-col bg-white snap-start">
                            <div className={`text-center py-5 border-b border-beige-dark/10 transition-colors select-none ${day.isToday ? "bg-sage/5" : ""} ${isDayPast ? "opacity-50" : ""}`}>
                                <p className="text-xs uppercase text-graphite/40 font-bold tracking-wider mb-1">
                                    {POLISH_DAYS_SHORT[day.date.getDay()]}
                                </p>
                                <p className={`text-xl font-bold ${day.isToday ? "text-sage" : "text-graphite"}`}>
                                    {formatDateShort(day.date)}
                                </p>
                            </div>

                            <div className="p-3 lg:p-4 flex flex-col gap-3 max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-beige-dark/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-sage/30 transition-colors pr-2">
                                {day.slots.length > 0 && !isDayPast ? (
                                    day.slots.map((slot) => {
                                        const isSelected = selectedSlot?.time === slot.time && selectedSlot?.date.getTime() === day.date.getTime();
                                        return (
                                            <button
                                                key={slot.id}
                                                disabled={!slot.available}
                                                onClick={() => isSelected ? setSelectedSlot(null) : setSelectedSlot({ date: day.date, time: slot.time })}
                                                className={`py-3 px-1 rounded-xl text-sm font-semibold transition-all duration-200 border-2
                                                    ${!slot.available
                                                    ? "bg-gray-50/50 text-gray-300 border-transparent cursor-not-allowed line-through decoration-gray-300/50"
                                                    : isSelected
                                                        ? "bg-sage text-white border-sage shadow-lg shadow-sage/20 scale-[1.02] ring-2 ring-sage/30 ring-offset-1"
                                                        : "bg-white text-graphite border-beige-dark/20 hover:border-sage hover:text-sage hover:shadow-md"
                                                }
                                                `}
                                            >
                                                {slot.time}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-40 select-none text-center">
                                        <svg className="w-6 h-6 text-graphite mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4M8 16l-4-4 4-4"/></svg>
                                        <span className="text-xs font-medium text-graphite">{isDayPast ? "Data minęła" : "Brak terminów"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
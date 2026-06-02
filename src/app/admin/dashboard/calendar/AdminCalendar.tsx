"use client";

import React, { useState } from "react";
import { useAdminCalendarLogic } from "@/hooks/useAdminCalendarLogic";
import { TReservationWithService } from "@/types/reservation";
import { motion, AnimatePresence } from "framer-motion";
import {WeekViewDesktop} from "@/app/admin/dashboard/calendar/sections/WeekViewDesktop";
import {ReservationModal} from "@/app/admin/dashboard/calendar/sections/ReservationModal";
import {MonthView} from "@/app/admin/dashboard/calendar/sections/MonthView";
import {WeekViewMobile} from "@/app/admin/dashboard/calendar/sections/WeekViewMobile";
import {DayView} from "@/app/admin/dashboard/calendar/sections/DayView";
import {CalendarHeader} from "@/app/admin/dashboard/calendar/sections/CalendarHeader";



export default function AdminCalendar({ initialReservations }: { initialReservations: TReservationWithService[] }) {
    const {
        currentDate, setCurrentDate, view, handleNavigate, handleToday,
        visibleReservations, formatHeaderDate, setView, getDaysOfWeek, getDaysInMonth
    } = useAdminCalendarLogic(initialReservations);

    const [selectedRes, setSelectedRes] = useState<TReservationWithService | null>(null);

    return (
        <div className="space-y-6">
            <CalendarHeader
                handleToday={handleToday} handleNavigate={handleNavigate}
                formatHeaderDate={formatHeaderDate} view={view} setView={setView}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    {view === 'day' && <DayView visibleReservations={visibleReservations} setSelectedRes={setSelectedRes} />}
                    {view === 'week' && (
                        <>
                            <WeekViewDesktop currentDate={currentDate} getDaysOfWeek={getDaysOfWeek} visibleReservations={visibleReservations} setSelectedRes={setSelectedRes} />
                            <WeekViewMobile currentDate={currentDate} getDaysOfWeek={getDaysOfWeek} visibleReservations={visibleReservations} setSelectedRes={setSelectedRes} />
                        </>
                    )}
                    {view === 'month' && <MonthView currentDate={currentDate} getDaysInMonth={getDaysInMonth} visibleReservations={visibleReservations} setSelectedRes={setSelectedRes} setCurrentDate={setCurrentDate} setView={setView} />}
                </motion.div>
            </AnimatePresence>

            {selectedRes && <ReservationModal selectedRes={selectedRes} setSelectedRes={setSelectedRes} />}
        </div>
    );
}
"use client";

import React from "react";
import { SLOT_MINUTES, businessTimeToPatient, timeToMinutes } from "@/lib/time";

type Props = {
    /** Clinic calendar day ("yyyy-MM-dd") the times refer to — needed for summer/winter time. */
    dateKey: string;
    startTime: string;
    endTime: string;
    /** Show the list of bookable slots (weekly schedule) or just the range (blocked time). */
    showSlots?: boolean;
    className?: string;
};

const dayShiftLabel = (shift: number) => (shift > 0 ? " (następnego dnia)" : shift < 0 ? " (poprzedniego dnia)" : "");

/** "You set 17:00–20:00 (UK) → patients in Poland see 18:00–21:00." */
export function PatientTimePreview({ dateKey, startTime, endTime, showSlots = false, className = "" }: Props) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (startMin === null || endMin === null) return null;

    if (endMin <= startMin) {
        return (
            <p className={`text-xs font-medium text-red-600 dark:text-red-400 ${className}`}>
                Godzina zakończenia musi być późniejsza niż rozpoczęcia.
            </p>
        );
    }

    const start = businessTimeToPatient(dateKey, startTime);
    const end = businessTimeToPatient(dateKey, endTime);
    if (!start || !end) return null;

    const slots: string[] = [];
    if (showSlots) {
        for (let m = startMin; m + SLOT_MINUTES <= endMin; m += SLOT_MINUTES) {
            const hhmm = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
            const converted = businessTimeToPatient(dateKey, hhmm);
            if (converted) slots.push(converted.time);
        }
    }

    return (
        <div className={`text-xs leading-relaxed text-graphite/60 dark:text-zinc-400 ${className}`}>
            <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>🇵🇱</span>
                Pacjenci w Polsce zobaczą:{" "}
                <strong className="font-mono text-graphite dark:text-zinc-200">
                    {start.time}–{end.time}
                </strong>
                {dayShiftLabel(start.dayShift)}
            </span>
            {showSlots && (
                <span className="block mt-0.5">
                    {slots.length > 0
                        ? <>Terminy w kalendarzu: <span className="font-mono">{slots.join(", ")}</span></>
                        : <span className="text-amber-600 dark:text-amber-400">Za krótki przedział — nie zmieści się żadna wizyta ({SLOT_MINUTES} min).</span>}
                </span>
            )}
        </div>
    );
}

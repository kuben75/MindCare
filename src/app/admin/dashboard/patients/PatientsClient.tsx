"use client";

import React, { useState } from "react";
import { formatDate, formatTime, getStatusBadge } from "@/utils/reservation-utils";
import { IPatient } from "@/types/patient";
import { motion, AnimatePresence } from "framer-motion";
import {Avatar} from "@/app/admin/dashboard/patients/sections/Avatar";
import {StatItem} from "@/app/admin/dashboard/patients/sections/StatItem";

export default function PatientsClient({ patients }: { patients: IPatient[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="relative group max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-graphite/40 dark:text-zinc-500 group-focus-within:text-sage dark:group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Szukaj pacjenta po imieniu, e-mailu lub telefonie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
                        w-full pl-12 pr-4 py-3.5
                        bg-white dark:bg-[#262626]
                        border border-beige-dark/30 dark:border-zinc-700
                        rounded-2xl text-sm font-medium
                        text-graphite dark:text-zinc-100
                        placeholder:text-graphite/40 dark:placeholder:text-zinc-500
                        shadow-sm hover:border-sage/40 dark:hover:border-zinc-500
                        focus:outline-none focus:ring-4 focus:ring-sage/10 focus:border-sage dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/10
                        transition-all duration-300
                    "
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-graphite/40 hover:text-graphite dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {filteredPatients.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center px-4 bg-white/50 dark:bg-[#262626]/50 rounded-3xl border border-beige-dark/20 dark:border-zinc-800 border-dashed">
                        <div className="w-16 h-16 bg-beige-light/80 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                            <svg className="w-8 h-8 text-graphite/30 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-graphite/70 dark:text-zinc-300">Brak wyników</p>
                        <p className="text-sm text-graphite/40 dark:text-zinc-500 mt-1 max-w-sm">{`Nie znaleźliśmy pacjenta pasującego do zapytania "${searchQuery}".`}</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredPatients.map((patient) => {
                            const isExpanded = expandedPatientId === patient.id;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    key={patient.id}
                                    className={`
                                        bg-white dark:bg-[#262626] 
                                        border ${isExpanded ? 'border-sage/40 dark:border-emerald-500/30' : 'border-beige-dark/20 dark:border-zinc-700'} 
                                        rounded-[24px] overflow-hidden 
                                        shadow-sm hover:shadow-md 
                                        transition-all duration-300 group
                                    `}
                                >
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center p-5 sm:p-6 gap-5 lg:gap-6">

                                        <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                                            <Avatar name={patient.name} />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-serif font-bold text-lg text-graphite dark:text-zinc-100 truncate">{patient.name}</h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[13px] text-graphite/50 dark:text-zinc-400 mt-0.5">
                                                    <a href={`mailto:${patient.email}`} className="hover:text-sage dark:hover:text-emerald-400 truncate transition-colors">
                                                        {patient.email}
                                                    </a>
                                                    <span className="hidden sm:inline text-graphite/20 dark:text-zinc-600">•</span>
                                                    <a href={`tel:${patient.phone}`} className="hover:text-sage dark:hover:text-emerald-400 transition-colors">
                                                        {patient.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto lg:flex lg:gap-6 shrink-0 py-4 lg:py-0 border-y border-beige-dark/10 lg:border-none dark:border-zinc-800">
                                            <StatItem label="Zakończone" value={patient.completedVisits} dotColor="bg-emerald-500" />
                                            <StatItem label="Zaplanowane" value={patient.upcomingVisits} dotColor="bg-amber-400" />
                                            <StatItem label="Anulowane" value={patient.cancelledVisits} dotColor="bg-red-400" />
                                        </div>

                                        <div className="flex items-end lg:items-center justify-between w-full lg:w-auto lg:flex-col lg:justify-center lg:items-end shrink-0 lg:min-w-[140px] gap-1">
                                            <div className="lg:text-right">
                                                <p className="text-[9px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-0.5 lg:mb-1">
                                                    Ostatnia wizyta
                                                </p>
                                                <p className="text-sm font-semibold text-graphite dark:text-zinc-200">
                                                    {patient.lastVisitDate ? formatDate(new Date(patient.lastVisitDate)) : 'Brak wizyt'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-0.5 lg:mb-1 lg:hidden">
                                                    LTV
                                                </p>
                                                <p className="text-sm font-bold text-sage dark:text-emerald-400 tabular-nums">
                                                    {patient.totalSpent} zł
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setExpandedPatientId(isExpanded ? null : patient.id)}
                                            className={`
                                                w-full lg:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 shrink-0 flex items-center justify-center gap-2
                                                ${isExpanded
                                                ? 'bg-graphite text-white dark:bg-zinc-200 dark:text-graphite shadow-md'
                                                : 'bg-beige-light/50 dark:bg-zinc-800 text-graphite dark:text-zinc-300 hover:bg-beige-dark/20 dark:hover:bg-zinc-700'
                                            }
                                            `}
                                        >
                                            {isExpanded ? 'Zwiń historię' : 'Historia'}
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="px-5 sm:px-6 pb-6 pt-2">
                                                    <div className="bg-beige-light/30 dark:bg-zinc-900/50 rounded-2xl p-1 border border-beige-dark/10 dark:border-zinc-800">
                                                        <h4 className="font-serif font-bold text-graphite dark:text-zinc-200 p-4 pb-2 flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-lg bg-sage/10 dark:bg-emerald-900/30 flex items-center justify-center">
                                                                <svg className="w-3.5 h-3.5 text-sage dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                            </div>
                                                            Historia rezerwacji
                                                        </h4>

                                                        {patient.history.length === 0 ? (
                                                            <div className="p-6 text-center text-sm text-graphite/40 dark:text-zinc-500">
                                                                Brak zarejestrowanych wizyt w systemie.
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 p-2">
                                                                {patient.history.map((visit) => (
                                                                    <div
                                                                        key={visit.id}
                                                                        className="group flex flex-col md:grid md:grid-cols-[1fr_1.5fr_auto_auto] items-start md:items-center gap-3 p-3 sm:px-4 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                                                            <div className="font-semibold text-sm text-graphite dark:text-zinc-200">
                                                                                {formatDate(new Date(visit.date))}
                                                                            </div>
                                                                            <div className="text-[11px] font-mono text-graphite/50 dark:text-zinc-500 bg-beige-dark/10 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                                                                {formatTime(new Date(visit.date))}
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-sm text-graphite/70 dark:text-zinc-400 truncate w-full">
                                                                            {visit.serviceName}
                                                                        </div>

                                                                        <div className="flex justify-between items-center w-full md:w-auto md:gap-8 mt-1 md:mt-0">
                                                                            <div className="font-bold text-sm text-graphite dark:text-zinc-100 tabular-nums">
                                                                                {visit.price} zł
                                                                            </div>
                                                                            <div className="scale-90 origin-right">
                                                                                {getStatusBadge(visit.status as string)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}


"use client";

import React from "react";
import { motion } from "framer-motion";
import {IActiveSessionsListProps} from "@/types/security";

export default function ActiveSessionsList({
                                               activeSessions,
                                               isSessionsLoading,
                                               currentSessionId,
                                               handleRevokeSession
                                           }: IActiveSessionsListProps) {
    if (isSessionsLoading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-graphite/40 dark:text-zinc-500 gap-3">
                <span className="animate-spin inline-block w-8 h-8 border-4 border-sage border-t-transparent rounded-full" />
                <span className="text-sm font-semibold tracking-wide">Pobieranie listy urządzeń...</span>
            </div>
        );
    }

    if (activeSessions.length === 0) {
        return (
            <div className="py-12 text-center text-graphite/40 dark:text-zinc-500 text-sm font-medium">
                Brak innych aktywnych sesji.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activeSessions.map((session) => {
                const isCurrentSession = session.id === currentSessionId;
                const isMobile = session.deviceInfo.includes("iOS") || session.deviceInfo.includes("Android");

                return (
                    <motion.div layout key={session.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border-2 transition-all ${isCurrentSession ? 'bg-sage/5 border-sage/30 dark:bg-emerald-500/5 dark:border-emerald-500/30 shadow-sm' : 'bg-white dark:bg-zinc-800 border-beige-dark/20 dark:border-zinc-700 hover:border-beige-dark/40 dark:hover:border-zinc-600'}`}>
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-full border ${isCurrentSession ? 'bg-sage/10 border-sage/20 text-sage dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-beige-light/50 border-beige-dark/20 text-graphite/40 dark:bg-zinc-900/50 dark:border-zinc-700 dark:text-zinc-500'}`}>
                                {isMobile ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-graphite dark:text-zinc-200 text-[15px] flex items-center gap-3">
                                    {session.deviceInfo}
                                    {isCurrentSession && (
                                        <span className="px-2.5 py-1 bg-sage text-white text-[9px] uppercase tracking-widest rounded-lg font-bold">Obecne urządzenie</span>
                                    )}
                                </div>
                                <div className="text-[11px] font-bold text-graphite/40 dark:text-zinc-500 mt-1.5 flex flex-wrap items-center gap-3 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                        IP: {session.ipAddress}
                                    </span>
                                    <span className="hidden sm:inline opacity-30">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        {new Date(session.createdAt).toLocaleDateString('pl-PL')} o {new Date(session.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isCurrentSession && (
                            <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="mt-4 sm:mt-0 w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-zinc-900 border-2 border-beige-dark/20 dark:border-zinc-700 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                Wyloguj
                            </button>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
import {STATUS_STYLES} from "@/constants/calendar";
import {ReservationStatus} from "@prisma/client";
import {AnimatePresence, motion} from "framer-motion";
import React from "react";

export const ReservationModal = ({ selectedRes, setSelectedRes }: any) => {
    const style = STATUS_STYLES[selectedRes.status as ReservationStatus];
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
            >

                <div className="absolute inset-0 bg-graphite/20 dark:bg-black/40 backdrop-blur-md" onClick={() => setSelectedRes(null)} />


                <motion.div
                    initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-lg bg-white/90 dark:bg-[#262626]/90 backdrop-blur-2xl border border-white/20 dark:border-zinc-700 rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    <div className={`px-8 py-6 border-b border-black/5 dark:border-white/5 ${style.bg}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border mb-3 ${style.bg} ${style.border} ${style.text}`}>
                                    {selectedRes.status}
                                </span>
                                <h2 className="text-3xl font-serif text-graphite dark:text-white tracking-tight leading-none">{selectedRes.patientName}</h2>
                            </div>
                            <button onClick={() => setSelectedRes(null)} className="p-2.5 bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 rounded-full transition-colors text-graphite dark:text-white backdrop-blur-md shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <span className="block text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    Czas i Data
                                </span>
                                <p className="text-graphite dark:text-zinc-200 font-semibold">{new Date(selectedRes.date).toLocaleString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                <p className="text-graphite/60 dark:text-zinc-400 font-mono mt-0.5">{new Date(selectedRes.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                    Kontakt
                                </span>
                                <p className="text-graphite dark:text-zinc-200 font-medium mb-0.5">{selectedRes.phone}</p>
                                <a href={`mailto:${selectedRes.email}`} className="text-sage dark:text-emerald-400 hover:underline truncate block">{selectedRes.email}</a>
                            </div>
                        </div>

                        <div className="p-5 bg-beige-light/40 dark:bg-zinc-800/50 rounded-2xl border border-beige-dark/20 dark:border-zinc-700/50">
                            <span className="block text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Usługa</span>
                            <div className="flex justify-between items-center">
                                <p className="text-graphite dark:text-zinc-100 font-bold text-lg">{selectedRes.service.name}</p>
                                <p className="font-mono text-sage dark:text-emerald-400 font-bold bg-sage/10 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-sage/20">{selectedRes.service.price} zł</p>
                            </div>
                        </div>

                        {selectedRes.privateNotes && (
                            <div>
                                <span className="block text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                    Poufna notatka z wizyty
                                </span>
                                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl text-sm text-graphite/80 dark:text-zinc-300 border border-amber-100 dark:border-amber-900/30 whitespace-pre-wrap leading-relaxed shadow-inner">
                                    {selectedRes.privateNotes}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
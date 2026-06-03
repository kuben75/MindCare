"use client";

import React from "react";
import { IActionMenuProps } from "@/types/reservation";
import { useActionMenu } from "@/hooks/useActionMenu";
import { motion, AnimatePresence } from "framer-motion";
import {Toast} from "@/components/ui/Toast";
import { createPortal } from "react-dom";

export default function ReservationActionMenu({ reservationId, currentStatus }: IActionMenuProps) {
    const {
        isOpen,
        isLoading: isMenuLoading,
        menuRef,
        openDirection,
        toggleMenuDirection,
        updateStatus,
        isEditModalOpen,
        handleEditClick,
        editForm,
        setEditForm,
        handleSaveNewDate,
        isSavingDate,
        setIsEditModalOpen, toast, hideToast, mounted
    } = useActionMenu({ reservationId, currentStatus });

    if (currentStatus === 'CANCELLED') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-not-allowed">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Zamknięta
            </span>
        );
    }

    return (
        <>
            <Toast toast={toast} onClose={hideToast} />

            <div className={`relative inline-block text-left ${isOpen ? 'z-[60]' : 'z-10'}`} ref={menuRef}>
                <button
                    onClick={toggleMenuDirection}
                    disabled={isMenuLoading}
                    className={`inline-flex items-center justify-center p-2 rounded-xl transition-all outline-none disabled:opacity-50 ${
                        isOpen
                            ? 'bg-sage text-white shadow-md shadow-sage/30'
                            : 'text-graphite/40 dark:text-zinc-400 hover:text-graphite hover:bg-beige-dark/10 dark:hover:text-white dark:hover:bg-zinc-700'
                    }`}
                >
                    {isMenuLoading ? (
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: openDirection === 'up' ? 10 : -10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.95, y: openDirection === 'up' ? 10 : -10, filter: "blur(4px)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`
                                absolute right-0 w-56 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-white/40 dark:border-zinc-700 z-[70] overflow-hidden p-1.5
                                ${openDirection === 'up' ? 'bottom-full mb-3' : 'mt-3'} 
                            `}
                        >
                            <div className="mb-1.5 pb-1.5 border-b border-beige-dark/10 dark:border-zinc-700/50">
                                <button
                                    onClick={handleEditClick}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-graphite dark:text-zinc-200 hover:bg-sage/10 hover:text-sage dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors outline-none"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Przełóż wizytę
                                </button>
                            </div>

                            <div className="px-3 py-1.5 text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest">
                                Zmień status
                            </div>
                            <div className="space-y-0.5">
                                <button onClick={() => updateStatus('PENDING')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-graphite dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors outline-none group">
                                    Oczekująca
                                    <span className="w-2 h-2 rounded-full bg-amber-400/50 group-hover:bg-amber-500 transition-colors" />
                                </button>
                                <button onClick={() => updateStatus('PAID')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-graphite dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors outline-none group">
                                    Opłacona
                                    <span className="w-2 h-2 rounded-full bg-emerald-400/50 group-hover:bg-emerald-500 transition-colors" />
                                </button>
                                <button onClick={() => updateStatus('COMPLETED')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-graphite dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors outline-none group">
                                    Zakończona
                                    <span className="w-2 h-2 rounded-full bg-blue-400/50 group-hover:bg-blue-500 transition-colors" />
                                </button>
                            </div>

                            <div className="mt-1.5 pt-1.5 border-t border-beige-dark/10 dark:border-zinc-700/50">
                                <button onClick={() => updateStatus('CANCELLED')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors outline-none">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Anuluj wizytę
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {mounted && createPortal(
                <AnimatePresence>
                    {isEditModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-graphite/40 dark:bg-black/60 backdrop-blur-sm z-[99999] flex items-end sm:items-center justify-center p-4 text-left"
                        >
                            {/* Wymuszenie blokady scrolla na body podczas działania modala */}
                            <style jsx global>{`
                    body {
                        overflow: hidden;
                    }
                `}</style>

                            <motion.div
                                initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="bg-white/95 dark:bg-[#262626]/95 backdrop-blur-2xl border border-white/20 dark:border-zinc-700 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()} // Zapobiega zamknięciu przy kliknięciu w sam modal
                            >
                                <div className="flex justify-between items-center px-6 py-5 border-b border-black/5 dark:border-white/5 bg-beige-light/30 dark:bg-zinc-800/50">
                                    <h2 className="text-xl font-serif font-bold text-graphite dark:text-white flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </span>
                                        Nowy termin
                                    </h2>
                                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white dark:bg-zinc-700 shadow-sm rounded-full text-graphite/40 dark:text-zinc-400 hover:text-graphite dark:hover:text-white transition-colors active:scale-95">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSaveNewDate} className="p-6">
                                    <p className="text-xs text-graphite/60 dark:text-zinc-400 mb-6 leading-relaxed">
                                        System zapisze nową datę, a pacjent otrzyma powiadomienie. Upewnij się, że termin został wcześniej z nim ustalony.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-1.5 pl-1">Data</label>
                                            <input type="date" required value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"/>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-1.5 pl-1">Godzina</label>
                                            <input type="time" required value={editForm.time} onChange={(e) => setEditForm({...editForm, time: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"/>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex gap-3">
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isSavingDate} className="flex-1 py-3.5 bg-white dark:bg-zinc-800 border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-bold hover:bg-beige-light/50 dark:hover:bg-zinc-700 transition-colors active:scale-95 text-graphite dark:text-zinc-300">
                                            Anuluj
                                        </button>
                                        <button type="submit" disabled={isSavingDate} className="flex-1 py-3.5 bg-sage hover:bg-[#8ea38a] text-white rounded-2xl text-sm font-bold shadow-[0_8px_20px_rgb(164,185,160,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                                            {isSavingDate ? (
                                                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                            ) : "Zapisz"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
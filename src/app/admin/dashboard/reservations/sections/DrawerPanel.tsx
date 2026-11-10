import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { IDrawerPanelProps } from "@/types/reservation";

export const DrawerPanel = ({
                                reservation, activeNoteTab, setActiveNoteTab, activeNotesText, setActiveNotesText,
                                handleSaveNotes, isSavingNotes, emailMessage, setEmailMessage, handleSendFollowUp, isSendingEmail, emailSuccess
                            }: IDrawerPanelProps) => {
    const isCompleted = reservation.status === 'COMPLETED';

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-x border-b border-sage/40 dark:border-emerald-500/40 bg-sage/5 dark:bg-emerald-900/10 rounded-b-2xl sm:rounded-b-3xl overflow-hidden shadow-inner -mt-1 relative z-0"
        >
            <div className="p-3.5 sm:p-6 lg:px-8">
                <div className="flex gap-1 mb-4 sm:mb-6 border-b border-sage/20 dark:border-emerald-500/20 overflow-x-auto pb-px">
                    <button
                        onClick={() => setActiveNoteTab('PRIVATE')}
                        className={`px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all border-b-2 whitespace-nowrap ${
                            activeNoteTab === 'PRIVATE'
                                ? 'border-sage text-sage dark:border-emerald-400 dark:text-emerald-400'
                                : 'border-transparent text-graphite/40 hover:text-graphite dark:text-zinc-500 dark:hover:text-zinc-300'
                        }`}
                    >
                        Notatki (gabinet)
                    </button>
                    {isCompleted && (
                        <button
                            onClick={() => setActiveNoteTab('EMAIL')}
                            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                                activeNoteTab === 'EMAIL'
                                    ? 'border-sage text-sage dark:border-emerald-400 dark:text-emerald-400'
                                    : 'border-transparent text-graphite/40 hover:text-graphite dark:text-zinc-500 dark:hover:text-zinc-300'
                            }`}
                        >
                            Podsumowanie (E-mail)
                        </button>
                    )}
                </div>

                {activeNoteTab === 'PRIVATE' && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-white/50 dark:border-zinc-700/50 relative pl-4 sm:pl-6">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-sage dark:bg-emerald-500 rounded-l-xl sm:rounded-l-2xl" />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <div>
                                <h4 className="text-sm font-bold text-graphite dark:text-zinc-200">Diagnoza i obserwacje</h4>
                                <p className="text-xs text-graphite/50 dark:text-zinc-400 mt-0.5">Widoczne wyłącznie dla Ciebie.</p>
                            </div>
                            <button
                                onClick={() => handleSaveNotes(reservation.id)}
                                disabled={isSavingNotes}
                                className="w-full sm:w-auto px-5 py-2.5 bg-graphite text-white dark:bg-zinc-100 dark:text-graphite text-xs font-bold rounded-xl shadow-md disabled:opacity-50 hover:opacity-90 transition-all active:scale-95 text-center shrink-0"
                            >
                                {isSavingNotes ? "Zapisywanie..." : "Zapisz zmiany"}
                            </button>
                        </div>

                        <textarea
                            rows={4}
                            placeholder="Wpisz prywatne notatki z sesji..."
                            value={activeNotesText}
                            onChange={(e) => setActiveNotesText(e.target.value)}
                            className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-beige-dark/30 dark:border-zinc-700 bg-beige-light/20 dark:bg-black/20 text-sm focus:ring-2 focus:ring-sage focus:outline-none resize-y transition-colors"
                        />
                    </motion.div>
                )}

                {activeNoteTab === 'EMAIL' && isCompleted && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-amber-200/50 dark:border-amber-900/30 relative pl-4 sm:pl-6">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400 dark:bg-amber-600 rounded-l-xl sm:rounded-l-2xl" />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-500">Wyślij podsumowanie</h4>
                                    <InfoTooltip
                                        title="Bezpośrednia komunikacja"
                                        description="Wiadomość z logo gabinetu zostanie wysłana na adres pacjenta. Idealne do przesyłania zaleceń lub materiałów po sesji."
                                    />
                                </div>
                                <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1 max-w-md leading-relaxed">
                                    Pacjent {reservation.patientName.split(' ')[0]} otrzyma ten tekst na swój e-mail.
                                </p>
                            </div>
                            <button
                                onClick={() => handleSendFollowUp(reservation.id)}
                                disabled={isSendingEmail || !emailMessage.trim() || emailSuccess}
                                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 active:scale-95 shrink-0"
                            >
                                {isSendingEmail ? "Wysyłanie..." : emailSuccess ? "Wysłano!" : "Wyślij e-mail"}
                            </button>
                        </div>

                        <div className="relative">
                            <textarea
                                rows={4}
                                placeholder="Cześć! Przesyłam materiały do pracy własnej..."
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                disabled={emailSuccess}
                                className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border border-amber-200/60 dark:border-amber-900/50 bg-white/70 dark:bg-black/20 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-y transition-all ${emailSuccess ? 'opacity-50' : ''}`}
                            />
                            <AnimatePresence>
                                {emailSuccess && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl">
                                        <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                            <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            Wiadomość doręczona!
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
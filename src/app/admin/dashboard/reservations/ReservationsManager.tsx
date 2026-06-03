"use client";

import React from "react";
import { ReservationStatus, Service } from "@prisma/client";
import { TReservationWithService } from "@/types/reservation";
import { useReservationManager } from "@/hooks/useReservationManager";
import { motion, AnimatePresence } from "framer-motion";
import {TAB_LABELS} from "@/constants/reservations";
import {ReservationCard} from "@/app/admin/dashboard/reservations/sections/ReservationCard";
import {DrawerPanel} from "@/app/admin/dashboard/reservations/sections/DrawerPanel";
import {Toast} from "@/components/ui/Toast";
import InfoTooltip from "@/components/ui/InfoTooltip";

export default function ReservationsManager({ initialReservations, services }: { initialReservations: TReservationWithService[], services: Service[] }) {
    const {
        activeTab, setActiveTab, searchQuery, setSearchQuery, isOpenModal, setIsOpenModal,
        formData, setFormData, handleSubmit, filteredReservations, expandedReservationId,
        activeNotesText, setActiveNotesText, isSavingNotes, handleSaveNotes, isSubmitting,
        handleToggleDrawer, activeNoteTab, setActiveNoteTab, emailMessage, setEmailMessage,
        handleSendFollowUp, isSendingEmail, emailSuccess, toast, hideToast
    } = useReservationManager({ initialReservations, services });

    return (
        <>
        <div className="space-y-8">

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">

                <div className="flex p-1.5 bg-beige-dark/10 dark:bg-zinc-900 rounded-2xl w-full xl:w-auto relative">
                    {(['upcoming', 'history', 'cancelled'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative flex-1 xl:flex-none px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors z-10 outline-none ${
                                activeTab === tab ? 'text-graphite dark:text-white' : 'text-graphite/50 dark:text-zinc-500 hover:text-graphite dark:hover:text-zinc-300'
                            }`}
                        >
                            {activeTab === tab && (
                                <motion.div layoutId="active-res-tab" className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-[0_2px_8px_rgb(0,0,0,0.08)] rounded-xl -z-10" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                            )}
                            {TAB_LABELS[tab]}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 sm:w-72 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-graphite/30 dark:text-zinc-500 group-focus-within:text-sage transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <input
                            type="text" placeholder="Szukaj pacjenta..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none dark:text-zinc-200 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                        />
                    </div>

                    <button
                        onClick={() => setIsOpenModal(true)}
                        className="px-6 py-3 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite rounded-2xl text-sm font-bold transition-all shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 flex items-center justify-center gap-2 shrink-0 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                        Dodaj wizytę
                    </button>
                </div>
            </div>

            <div className="space-y-4 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {filteredReservations.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-zinc-900/20 backdrop-blur-sm border border-dashed border-beige-dark/30 dark:border-zinc-700 rounded-3xl">
                            <div className="w-20 h-20 bg-beige-light/50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                                <svg className="w-10 h-10 text-graphite/20 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                            </div>
                            <h3 className="text-xl font-serif text-graphite dark:text-zinc-200 mb-2">Brak rezerwacji</h3>
                            <p className="text-sm font-medium text-graphite/50 dark:text-zinc-500 max-w-sm">
                                {searchQuery ? "Nikt nie pasuje do tego wyszukiwania." : "Lista jest pusta. Przełącz zakładkę lub dodaj nową wizytę."}
                            </p>
                        </motion.div>
                    ) : (
                        filteredReservations.map((reservation) => {
                            const isExpanded = expandedReservationId === reservation.id;
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    key={reservation.id}
                                    className="relative"
                                >
                                    <ReservationCard
                                        reservation={reservation}
                                        isExpanded={isExpanded}
                                        onToggleDrawer={() => handleToggleDrawer(reservation)}
                                    />

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <DrawerPanel
                                                reservation={reservation}
                                                activeNoteTab={activeNoteTab} setActiveNoteTab={setActiveNoteTab}
                                                activeNotesText={activeNotesText} setActiveNotesText={setActiveNotesText}
                                                handleSaveNotes={handleSaveNotes} isSavingNotes={isSavingNotes}
                                                emailMessage={emailMessage} setEmailMessage={setEmailMessage}
                                                handleSendFollowUp={handleSendFollowUp} isSendingEmail={isSendingEmail} emailSuccess={emailSuccess}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isOpenModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-graphite/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white/95 dark:bg-[#262626]/95 backdrop-blur-2xl border border-white/20 dark:border-zinc-700 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-visible"
                        >
                            <div className="flex justify-between items-center px-8 py-6 border-b border-black/5 dark:border-white/5 bg-beige-light/30 dark:bg-zinc-800/50 rounded-t-[2rem]">
                                <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-serif font-bold text-graphite dark:text-white">Nowa wizyta</h2>
                                <InfoTooltip
                                    title="Ręczne dodawanie rezerwacji"
                                    description="Wizyta dodana z tego poziomu omija system płatności Stripe. Jeśli nadasz jej status 'Oczekuje na wpłatę', pacjent natychmiast otrzyma e-mail z Twoim numerem konta (IBAN) z prośbą o tradycyjny przelew."
                                />
                                </div>
                                <button onClick={() => setIsOpenModal(false)} className="p-2 bg-white dark:bg-zinc-700 shadow-sm rounded-full text-graphite/40 dark:text-zinc-400 hover:text-graphite dark:hover:text-white transition-colors active:scale-95">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-2 pl-1">Imię i Nazwisko</label>
                                    <input type="text" required value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-2 pl-1">E-mail</label>
                                        <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-2 pl-1">Telefon</label>
                                        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-2 pl-1">Data</label>
                                        <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-2 pl-1">Godzina</label>
                                        <input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-2 pl-1">Usługa</label>
                                        <select value={formData.serviceId} onChange={(e) => setFormData({...formData, serviceId: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] appearance-none">
                                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-2 pl-1">Status rezerwacji</label>
                                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as ReservationStatus})} className="w-full px-5 py-3.5 rounded-2xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-sage/50 focus:border-sage focus:outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] appearance-none">
                                            <option value="PAID">Opłacona</option>
                                            <option value="PENDING">Oczekuje na wpłatę</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-black/5 dark:border-white/5 flex gap-3">
                                    <button type="button" onClick={() => setIsOpenModal(false)} disabled={isSubmitting} className="flex-1 py-4 bg-white dark:bg-zinc-800 border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-bold hover:bg-beige-light/50 dark:hover:bg-zinc-700 transition-colors active:scale-95">
                                        Anuluj
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite rounded-2xl text-sm font-bold shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                                        {isSubmitting ? (
                                            <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Trwa zapis...</>
                                        ) : "Potwierdź wizytę"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        <Toast toast={toast} onClose={hideToast} />
        </>
    );
}
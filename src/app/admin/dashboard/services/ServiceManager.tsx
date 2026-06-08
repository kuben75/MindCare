"use client";

import { Service } from "@prisma/client";
import { useServiceManager } from "@/hooks/useServiceManager";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/ui/Toast";
import {containerVariants} from "@/framer-motion/animation-logs";

export default function ServiceManager({ initialServices }: { initialServices: Service[] }) {
    const {
        services, isLoading, editingId, name, duration, price,
        handleEditClick, handleCancelEdit, handleSave, handleDelete,
        handleToggleActive, setName, setDuration, setPrice, toast, hideToast
    } = useServiceManager({ initialServices });


    return (
        <motion.div className="space-y-10 relative" variants={containerVariants} initial="hidden" animate="visible">
            <Toast toast={toast} onClose={hideToast} />

            <motion.div
                layout
                className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${editingId ? 'bg-amber-50 text-amber-500' : 'bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                        {editingId ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 tracking-tight">
                            {editingId ? "Tryb edycji usługi" : "Dodaj nową usługę do katalogu"}
                        </h2>
                        {editingId && <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mt-0.5">Nadpisujesz istniejące dane</p>}
                    </div>
                </div>

                <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-5 items-start lg:items-end">
                    <div className="flex-1 w-full relative">
                        <label className="absolute -top-2.5 left-3 bg-white/80 dark:bg-[#202022] backdrop-blur px-1 text-[9px] font-bold uppercase tracking-widest text-graphite/60 dark:text-zinc-400 z-10">Nazwa wizyty</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Konsultacja indywidualna (Skype)" className="w-full px-5 py-4 bg-transparent border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none transition-all placeholder:font-medium placeholder:opacity-40 shadow-[0_2px_10px_rgb(0,0,0,0.02)]" />
                    </div>

                    <div className="flex gap-4 w-full lg:w-72 shrink-0">
                        <div className="flex-1 relative">
                            <label className="absolute -top-2.5 left-3 bg-white/80 dark:bg-[#202022] backdrop-blur px-1 text-[9px] font-bold uppercase tracking-widest text-graphite/60 dark:text-zinc-400 z-10">Minuty</label>
                            <input type="number" required min="5" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-5 py-4 bg-transparent border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-mono font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-center" />
                        </div>
                        <div className="flex-1 relative">
                            <label className="absolute -top-2.5 left-3 bg-white/80 dark:bg-[#202022] backdrop-blur px-1 text-[9px] font-bold uppercase tracking-widest text-graphite/60 dark:text-zinc-400 z-10">Cena (PLN)</label>
                            <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-5 py-4 bg-transparent border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-mono font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-center" />
                        </div>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="flex-1 lg:flex-none px-6 py-4 border border-beige-dark/30 dark:border-zinc-700 text-graphite dark:text-zinc-300 rounded-2xl hover:bg-beige-light/50 dark:hover:bg-zinc-800 transition-colors text-sm font-bold active:scale-95">
                                Anuluj
                            </button>
                        )}
                        <button type="submit" disabled={isLoading} className={`flex-1 lg:flex-none px-8 py-4 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-graphite dark:bg-zinc-100 dark:text-graphite'} disabled:opacity-50`}>
                            {isLoading ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> : (editingId ? "Zapisz zmiany" : "Dodaj do oferty")}
                        </button>
                    </div>
                </form>
            </motion.div>

            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-6 tracking-tight pl-2">Katalog Cennikowy</h2>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {services.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center border-2 border-dashed border-beige-dark/20 dark:border-zinc-800 rounded-3xl">
                                <span className="text-sm font-bold text-graphite/40 dark:text-zinc-500">Brak dodanych usług. Katalog świeci pustkami.</span>
                            </motion.div>
                        ) : (
                            services.map(service => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    key={service.id}
                                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                                        service.isActive
                                            ? "bg-white dark:bg-zinc-800/80 border-beige-dark/20 dark:border-zinc-700 shadow-sm hover:border-sage/40 hover:shadow-md"
                                            : "bg-beige-light/20 dark:bg-zinc-900/30 border-transparent opacity-60 grayscale"
                                    }`}
                                >
                                    <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                        <div className={`hidden sm:flex w-12 h-12 rounded-xl items-center justify-center shrink-0 border transition-colors ${service.isActive ? 'bg-sage/5 border-sage/20 text-sage dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 border-gray-200 text-gray-400 dark:bg-zinc-800 dark:border-zinc-700'}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-graphite dark:text-zinc-100 truncate">{service.name}</h3>
                                            <div className="flex gap-4 mt-1 font-mono text-xs font-bold text-graphite/60 dark:text-zinc-400">
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {service.duration} min
                                                </span>
                                                <span className="flex items-center gap-1.5 text-sage dark:text-emerald-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402-2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {service.price} PLN
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleToggleActive(service)}
                                            title={service.isActive ? "Ukryj usługę z kalendarza pacjenta" : "Odkryj usługę"}
                                            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${service.isActive ? 'bg-sage dark:bg-emerald-500' : 'bg-graphite/20 dark:bg-zinc-700'}`}
                                        >
                                            <motion.div animate={{ x: service.isActive ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-[2px] left-[2px] w-5 h-5 bg-white shadow-sm rounded-full" />
                                        </button>
                                        <div className="w-px h-6 bg-beige-dark/20 dark:bg-zinc-700 mx-1" />
                                        <button onClick={() => handleEditClick(service)} title="Edytuj" className="p-2 text-graphite/40 hover:text-amber-500 hover:bg-amber-50 dark:text-zinc-500 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 rounded-xl transition-colors outline-none active:scale-90">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(service.id, service.name)} title="Usuń na zawsze" className="p-2 text-graphite/40 hover:text-red-500 hover:bg-red-50 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-xl transition-colors outline-none active:scale-90">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
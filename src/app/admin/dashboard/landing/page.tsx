"use client";

import Link from "next/link";
import { useLandingPage } from "@/hooks/useLandingPage";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/ui/Toast";
import {containerVariants, itemVariants} from "@/framer-motion/animation-landing";
export default function LandingDashboardPage() {
    const { templates, isLoading, actionLoading, handleActivate, handleDelete, toast, hideToast } = useLandingPage();

    if (isLoading) {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-graphite/40 dark:text-zinc-500">
                <span className="animate-spin inline-block w-10 h-10 border-[3px] border-sage border-t-transparent rounded-full shadow-sm"></span>
                <p className="font-medium tracking-wide">Wczytywanie Twoich projektów...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-8 max-w-[1400px] mx-auto pb-16 px-2 sm:px-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Toast toast={toast} onClose={hideToast} />

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                         Stwórz wyjątkową wizytówkę swojej strony
                    </p>
                    <h1 className="text-3xl font-serif text-graphite dark:text-zinc-100 tracking-tight mb-2">
                        Wizytówka Strony
                    </h1>
                    <p className="text-graphite/60 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                        Twórz i testuj różne warianty pierwszej sekcji widocznej dla pacjentów (teksty, pozycje i
                        zdjęcia). Ten, który ustawisz jako główny, wyświetli się natychmiast na stronie głównej.
                    </p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                    <Link
                        href="/admin/dashboard/landing/new"
                        className="group w-full md:w-auto px-6 py-3.5 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite rounded-2xl text-sm font-bold tracking-wide transition-all shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 active:scale-95"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Zaprojektuj nowy wygląd
                    </Link>
                </div>
            </motion.div>

            <AnimatePresence mode="popLayout">
                {templates.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border-2 border-dashed border-beige-dark/50 dark:border-zinc-700/80 rounded-[3rem] p-16 text-center shadow-sm"
                    >
                        <div className="w-20 h-20 bg-beige-light/50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3 border border-beige-dark/20 dark:border-zinc-700/50">
                            <svg className="w-10 h-10 text-sage/60 dark:text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-2xl font-serif text-graphite dark:text-zinc-200 mb-2">Pusto na produkcji</h3>
                        <p className="text-sm font-medium text-graphite/50 dark:text-zinc-500 mb-6 max-w-sm mx-auto">
                            Zbuduj pierwszy powitalny panel z Twoim zdjęciem i wezwaniem do akcji dla pacjentów.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {templates.map((template) => {
                            const isTextLeft = template.layout === "TEXT_LEFT";
                            const isHorizontal = template.imageStyle === "HORIZONTAL";

                            return (
                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    key={template.id}
                                    className={`group flex flex-col sm:flex-row bg-white/80 dark:bg-zinc-900/60 backdrop-blur-lg rounded-[2rem] overflow-hidden border-2 transition-all duration-300 relative ${
                                        template.isActive
                                            ? 'border-sage/40 dark:border-emerald-500/50 shadow-[0_12px_40px_rgba(164,185,160,0.25)] dark:shadow-[0_12px_40px_rgba(16,185,129,0.1)] z-10'
                                            : 'border-beige-dark/20 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-sage/30 dark:hover:border-emerald-500/30'
                                    }`}
                                >
                                    <div className="w-full sm:w-56 h-56 sm:h-auto shrink-0 relative bg-beige-dark/20 dark:bg-zinc-800 overflow-hidden">
                                        <img
                                            src={template.imageUrl || "/photo-horizontal.jpg"}
                                            alt="Miniaturka Szablonu"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 sm:opacity-100" />

                                        {template.isActive && (
                                            <div className="absolute top-4 left-4 bg-sage text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-widest border border-sage-light/20">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                                Widoczny
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between bg-gradient-to-br from-transparent to-beige-light/10 dark:to-zinc-800/10">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                <span className="text-[10px] font-bold text-graphite/50 dark:text-zinc-400 bg-beige-light dark:bg-zinc-800 border border-beige-dark/20 dark:border-zinc-700 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                                    {isTextLeft ? "Układ: Prawy" : "Układ: Lewy"}
                                                </span>
                                                <span className="text-[10px] font-bold text-graphite/50 dark:text-zinc-400 bg-beige-light dark:bg-zinc-800 border border-beige-dark/20 dark:border-zinc-700 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                                    {isHorizontal ? "Zdj: Poziom" : template.imageStyle === "VERTICAL" ? "Zdj: Pion" : "Zdj: Kwadrat"}
                                                </span>
                                            </div>

                                            <h3 className="font-serif text-xl text-graphite dark:text-zinc-100 font-bold line-clamp-2 leading-tight">
                                                {template.title.replace(/<[^>]*>?/gm, '').replace(/\n/g, ' ')}
                                            </h3>
                                            <p className="text-graphite/40 dark:text-zinc-500 text-[11px] font-semibold mt-3 uppercase tracking-widest">
                                                Utworzono: {new Date(template.createdAt).toLocaleDateString('pl-PL')}
                                            </p>
                                        </div>

                                        <div className="mt-8 flex flex-col gap-3">
                                            {template.isActive ? (
                                                <div className="w-full text-center py-3 bg-sage/10 dark:bg-emerald-500/10 text-sage dark:text-emerald-400 font-bold rounded-xl text-xs uppercase tracking-widest border border-sage/20 dark:border-emerald-500/20 shadow-inner cursor-default">
                                                    Główny profil
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivate(template.id)}
                                                    disabled={actionLoading === template.id}
                                                    className="w-full py-3 bg-white dark:bg-zinc-800 border-2 border-sage dark:border-emerald-500 text-sage dark:text-emerald-400 font-bold rounded-xl text-sm hover:bg-sage hover:text-white dark:hover:bg-emerald-500 dark:hover:text-zinc-900 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading === template.id ? <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : "Publikuj"}
                                                </button>
                                            )}

                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/dashboard/landing/edit/${template.id}`}
                                                    className="flex-1 text-center py-2.5 bg-beige-light/50 dark:bg-zinc-800/80 border border-beige-dark/20 dark:border-zinc-700 text-graphite/70 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-beige-dark/20 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                                                >
                                                    Edytuj
                                                </Link>

                                                {!template.isActive && (
                                                    <button
                                                        onClick={() => handleDelete(template.id, template.isActive)}
                                                        className="flex-[0.5] py-2.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors outline-none active:scale-95 flex justify-center items-center"
                                                        title="Usuń szablon"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
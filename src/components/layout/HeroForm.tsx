"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HeroPreview } from "@/components/layout/HeroPreview";
import { THeroProps } from "@/types/hero";
import { Toast } from "@/components/ui/Toast";
import {AnimatePresence, motion} from "framer-motion";
import {useHeroForm} from "@/hooks/useHeroForm";

export default function HeroForm({ initialData }: { initialData?: THeroProps }) {
const  {
    title, setTitle,
    subtitle, setSubtitle,
    layout, setLayout,
    imageStyle, setImageStyle,
    imageFile, handleImageChange,
    previewUrl,
    showPrimaryButton, setShowPrimaryButton,
    primaryButtonText, setPrimaryButtonText,
    primaryButtonLink, setPrimaryButtonLink,
    showZnanyLekarz, setShowZnanyLekarz,
    isLoading,
    handleSubmit, toast, hideToast, isEditMode
} = useHeroForm({initialData});
    return (
        <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-16 px-2 sm:px-6 relative">
            <Toast toast={toast} onClose={hideToast} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-graphite dark:text-zinc-100 tracking-tight mb-2">
                        {isEditMode ? "Edycja wizytówki" : "Kreator nowej wizytówki"}
                    </h1>
                    <p className="text-graphite/60 dark:text-zinc-400 text-sm font-medium">Buduj i modyfikuj to, co pacjent widzi jako pierwsze.</p>
                </div>
                <Link
                    href="/admin/dashboard/landing"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-beige-dark/20 dark:border-zinc-800 text-graphite dark:text-zinc-200 rounded-2xl hover:bg-beige-light/50 dark:hover:bg-zinc-800/80 transition-colors shadow-sm font-bold text-sm active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Wróć do projektów
                </Link>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start relative">

                <form
                    onSubmit={handleSubmit}
                    className="w-full xl:w-[480px] shrink-0 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-beige-dark/20 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10"
                >
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 border-b border-beige-dark/20 dark:border-zinc-800 pb-3">
                            <div className="w-8 h-8 rounded-xl bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <span className="font-bold text-sm">1</span>
                            </div>
                            <h3 className="font-bold text-graphite dark:text-zinc-100 uppercase tracking-widest text-xs">Teksty powitalne</h3>
                        </div>

                        <div className="relative">
                            <label className="absolute -top-2.5 left-3 bg-white/80 dark:bg-[#202022] backdrop-blur px-1 text-[9px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 z-10">Hasło główne</label>
                            <textarea
                                rows={4} required value={title} onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-5 py-4 bg-transparent border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] resize-none"
                            />
                            <div className="flex items-start gap-2 mt-2 px-1 text-[11px] font-medium text-graphite/50 dark:text-zinc-400 leading-relaxed">
                                <svg className="w-3.5 h-3.5 shrink-0 text-sage dark:text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span><b>Enter</b> = nowa linia. Owiń wyraz w <b>*gwiazdki*</b> aby zrobić go zielonym.</span>
                            </div>
                        </div>

                        <div className="relative pt-2">
                            <label className="absolute -top-0.5 left-3 bg-white/80 dark:bg-[#202022] backdrop-blur px-1 text-[9px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 z-10">Opis szczegółowy</label>
                            <textarea
                                rows={3} required value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full px-5 py-4 bg-transparent border border-beige-dark/30 dark:border-zinc-700 rounded-2xl text-sm font-medium text-graphite/80 dark:text-zinc-300 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center gap-3 border-b border-beige-dark/20 dark:border-zinc-800 pb-3">
                            <div className="w-8 h-8 rounded-xl bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <span className="font-bold text-sm">2</span>
                            </div>
                            <h3 className="font-bold text-graphite dark:text-zinc-100 uppercase tracking-widest text-xs">Układ sekcji</h3>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1">Gdzie umieścić zdjęcie?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setLayout("TEXT_LEFT")} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all outline-none ${layout === "TEXT_LEFT" ? "border-sage bg-sage/5 dark:border-emerald-500/50 dark:bg-emerald-500/10 shadow-[0_4px_15px_rgba(164,185,160,0.2)]" : "border-beige-dark/20 dark:border-zinc-700 hover:border-sage/30 dark:hover:border-emerald-500/30 bg-transparent"}`}>
                                    <div className="flex flex-col gap-1.5 w-1/2">
                                        <div className="h-1.5 bg-graphite/20 dark:bg-zinc-600 rounded-full w-full"></div>
                                        <div className="h-1.5 bg-graphite/20 dark:bg-zinc-600 rounded-full w-2/3"></div>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-graphite/30 dark:bg-zinc-500 shrink-0"></div>
                                </button>
                                <button type="button" onClick={() => setLayout("TEXT_RIGHT")} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all outline-none ${layout === "TEXT_RIGHT" ? "border-sage bg-sage/5 dark:border-emerald-500/50 dark:bg-emerald-500/10 shadow-[0_4px_15px_rgba(164,185,160,0.2)]" : "border-beige-dark/20 dark:border-zinc-700 hover:border-sage/30 dark:hover:border-emerald-500/30 bg-transparent"}`}>
                                    <div className="w-10 h-10 rounded-lg bg-graphite/30 dark:bg-zinc-500 shrink-0"></div>
                                    <div className="flex flex-col gap-1.5 w-1/2 items-end">
                                        <div className="h-1.5 bg-graphite/20 dark:bg-zinc-600 rounded-full w-full"></div>
                                        <div className="h-1.5 bg-graphite/20 dark:bg-zinc-600 rounded-full w-2/3"></div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1 mt-6">Kształt portretu</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button type="button" onClick={() => setImageStyle("HORIZONTAL")} className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all outline-none ${imageStyle === "HORIZONTAL" ? "border-sage bg-sage/5 dark:border-emerald-500/50 dark:bg-emerald-500/10 text-sage dark:text-emerald-400" : "border-beige-dark/20 dark:border-zinc-700 text-graphite/40 hover:border-sage/30 bg-transparent"}`}>
                                    <div className={`w-8 h-5 rounded transition-colors ${imageStyle === "HORIZONTAL" ? "bg-sage dark:bg-emerald-400" : "bg-graphite/20 dark:bg-zinc-600"}`}></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Poziom</span>
                                </button>
                                <button type="button" onClick={() => setImageStyle("SQUARE")} className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all outline-none ${imageStyle === "SQUARE" ? "border-sage bg-sage/5 dark:border-emerald-500/50 dark:bg-emerald-500/10 text-sage dark:text-emerald-400" : "border-beige-dark/20 dark:border-zinc-700 text-graphite/40 hover:border-sage/30 bg-transparent"}`}>
                                    <div className={`w-6 h-6 rounded transition-colors ${imageStyle === "SQUARE" ? "bg-sage dark:bg-emerald-400" : "bg-graphite/20 dark:bg-zinc-600"}`}></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Kwadrat</span>
                                </button>
                                <button type="button" onClick={() => setImageStyle("VERTICAL")} className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all outline-none ${imageStyle === "VERTICAL" ? "border-sage bg-sage/5 dark:border-emerald-500/50 dark:bg-emerald-500/10 text-sage dark:text-emerald-400" : "border-beige-dark/20 dark:border-zinc-700 text-graphite/40 hover:border-sage/30 bg-transparent"}`}>
                                    <div className={`w-5 h-7 rounded transition-colors ${imageStyle === "VERTICAL" ? "bg-sage dark:bg-emerald-400" : "bg-graphite/20 dark:bg-zinc-600"}`}></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Pion</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1 mt-6">Zdjęcie wizerunkowe</label>
                            <label className="relative cursor-pointer group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-beige-dark/40 dark:border-zinc-700 rounded-2xl hover:border-sage/50 dark:hover:border-emerald-500/50 bg-beige-light/10 dark:bg-black/10 transition-all overflow-hidden">
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Podgląd" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"/>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-graphite dark:bg-zinc-100 text-white dark:text-graphite px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg">Zmień zdjęcie</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-graphite/40 dark:text-zinc-500">
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                        <span className="text-xs font-bold uppercase tracking-widest">Wybierz plik z dysku</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-beige-dark/20 dark:border-zinc-800 pb-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <span className="font-bold text-sm">3</span>
                            </div>
                            <h3 className="font-bold text-graphite dark:text-zinc-100 uppercase tracking-widest text-xs">Przyciski Akcji</h3>
                        </div>

                        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${showPrimaryButton ? 'border-sage/40 bg-sage/5 dark:border-emerald-500/40 dark:bg-emerald-900/10' : 'border-beige-dark/20 dark:border-zinc-800 bg-transparent'}`}>
                            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowPrimaryButton(!showPrimaryButton)}>
                                <div>
                                    <span className="text-sm font-bold text-graphite dark:text-zinc-200">Przycisk główny (CTA)</span>
                                    <p className="text-[11px] font-medium text-graphite/50 dark:text-zinc-500 mt-0.5">Zachęca do akcji np. "Zarezerwuj wizytę"</p>
                                </div>
                                <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${showPrimaryButton ? 'bg-sage dark:bg-emerald-500' : 'bg-graphite/20 dark:bg-zinc-700'}`}>
                                    <motion.div animate={{ x: showPrimaryButton ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 left-0.5 w-5 h-5 bg-white shadow-sm rounded-full" />
                                </div>
                            </div>

                            <AnimatePresence>
                                {showPrimaryButton && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="mt-5 pt-5 border-t border-sage/20 dark:border-emerald-500/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label className="absolute -top-2.5 left-3 bg-[#faf9f6] dark:bg-[#1a1f1a] px-1 text-[9px] font-bold uppercase tracking-widest text-sage dark:text-emerald-400 z-10 transition-colors">Etykieta przycisku</label>
                                                <input type="text" value={primaryButtonText} onChange={(e) => setPrimaryButtonText(e.target.value)} placeholder="np. Zobacz kalendarz" className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-sage/30 dark:border-emerald-500/30 rounded-xl text-sm font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]" />
                                            </div>
                                            <div className="relative">
                                                <label className="absolute -top-2.5 left-3 bg-[#faf9f6] dark:bg-[#1a1f1a] px-1 text-[9px] font-bold uppercase tracking-widest text-sage dark:text-emerald-400 z-10 transition-colors">Gdzie ma kierować?</label>
                                                <input type="text" value={primaryButtonLink} onChange={(e) => setPrimaryButtonLink(e.target.value)} placeholder="/#kalendarz" className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-sage/30 dark:border-emerald-500/30 rounded-xl text-sm font-bold text-graphite dark:text-zinc-200 focus:ring-2 focus:ring-sage/50 outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${showZnanyLekarz ? 'border-sage/40 bg-sage/5 dark:border-emerald-500/40 dark:bg-emerald-900/10' : 'border-beige-dark/20 dark:border-zinc-800 bg-transparent hover:border-beige-dark/50'}`}>
                            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowZnanyLekarz(!showZnanyLekarz)}>
                                <div>
                                    <span className="text-sm font-bold text-graphite dark:text-zinc-200">Odznaka ZnanyLekarz.pl</span>
                                    <p className="text-[11px] font-medium text-graphite/50 dark:text-zinc-500 mt-0.5">Buduje zaufanie na podstawie zewnętrznych opinii</p>
                                </div>
                                <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${showZnanyLekarz ? 'bg-sage dark:bg-emerald-500' : 'bg-graphite/20 dark:bg-zinc-700'}`}>
                                    <motion.div animate={{ x: showZnanyLekarz ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 left-0.5 w-5 h-5 bg-white shadow-sm rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-beige-dark/20 dark:border-zinc-800 mt-10">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-8 py-4 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite font-bold rounded-2xl shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-sm tracking-wide"
                        >
                            {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white dark:border-graphite/30 dark:border-t-graphite rounded-full" /> : (isEditMode ? "Aktualizuj szablon w bazie" : "Zapisz do kolekcji projektów")}
                        </button>
                    </div>
                </form>

                <div className="w-full flex-1 xl:sticky xl:top-6 rounded-[3rem] border border-beige-dark/20 dark:border-zinc-800 shadow-2xl overflow-hidden bg-white dark:bg-[#1a1a1a] relative group">
                    <div className="absolute top-0 inset-x-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-beige-dark/20 dark:border-zinc-800 py-3 text-center z-50 flex items-center justify-center gap-2">

                        <span className="text-[10px] font-bold text-graphite dark:text-zinc-300 uppercase tracking-widest">Podgląd na żywo</span>
                    </div>

                    <div className="mt-12 pointer-events-none">
                        <HeroPreview
                            title={title} subtitle={subtitle} imageUrl={previewUrl}
                            layout={layout} imageStyle={imageStyle} showPrimaryButton={showPrimaryButton}
                            primaryButtonText={primaryButtonText} primaryButtonLink={primaryButtonLink}
                            showZnanyLekarz={showZnanyLekarz} isPreview={true}
                        />
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white dark:from-[#1a1a1a] to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
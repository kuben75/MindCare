"use client";

import dynamic from "next/dynamic";
import { TInitialData } from "@/types/editor";
import { Toast } from "@/components/ui/Toast";
import { motion } from "framer-motion";
import {usePostForm} from "@/hooks/usePostForm";

const BlockEditor = dynamic(() => import("@/components/layout/BlockEditor"), {
    ssr: false,
    loading: () => (
        <div className="w-full min-h-[400px] border border-dashed border-beige-dark/50 dark:border-zinc-700 rounded-3xl bg-beige-light/10 dark:bg-zinc-900/20 p-12 flex flex-col items-center justify-center text-graphite/40 dark:text-zinc-500">
            <span className="animate-spin inline-block w-8 h-8 border-4 border-sage border-t-transparent rounded-full mb-4"></span>
            Wczytywanie edytora...
        </div>
    )
});

export default function PostForm({ initialData }: { initialData?: TInitialData }) {
    const {
        title,
        setTitle,
        content,
        setContent,
        isPublished,
        postId,
        isLoading,
        lastSaved,
        saveStatus,
        handleManualSubmit,
        handleDelete,
        handleGoBack,
        toast,
        hideToast
    } = usePostForm({ initialData });
    return (
        <div className="max-w-[1000px] mx-auto pb-24 animate-fade-in relative px-4 sm:px-8">
            <Toast toast={toast} onClose={hideToast} />

            <motion.div
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="sticky top-6 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-4"
            >
                <div className="flex items-center gap-4 px-2">
                    <button onClick={handleGoBack} className="w-10 h-10 flex items-center justify-center bg-beige-light/50 dark:bg-zinc-800 rounded-xl text-graphite/60 dark:text-zinc-400 hover:text-graphite dark:hover:text-white hover:bg-beige-dark/20 dark:hover:bg-zinc-700 transition-all active:scale-95" title="Wróć do listy">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 border ${isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' : 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isPublished ? "Opublikowany" : "Szkic"}
                        </span>

                        <div className="text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest hidden sm:flex items-center gap-2">
                            <div className="w-px h-4 bg-beige-dark/30 dark:bg-zinc-700" />
                            {saveStatus === "saving" && <><span className="animate-spin inline-block w-3 h-3 border-2 border-sage border-t-transparent rounded-full" /> Zapisywanie...</>}
                            {saveStatus === "saved" && lastSaved && `Zapisano ${lastSaved.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`}
                            {saveStatus === "error" && <span className="text-red-500 dark:text-red-400">Błąd zapisu</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto px-2 sm:px-0">
                    {postId && (
                        <button type="button" onClick={handleDelete} className="p-2.5 text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors outline-none active:scale-90" title="Usuń artykuł">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleManualSubmit(false)}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-2 border-beige-dark/40 dark:border-zinc-700 text-graphite/60 dark:text-zinc-400 rounded-xl hover:text-graphite dark:hover:text-white hover:bg-beige-light/50 dark:hover:bg-zinc-800 transition-all outline-none active:scale-95 disabled:opacity-50"
                    >
                        Zapisz szkic
                    </button>
                    <button
                        type="button"
                        onClick={() => handleManualSubmit(true)}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-sage text-white rounded-xl shadow-[0_4px_15px_rgb(164,185,160,0.4)] hover:shadow-[0_4px_20px_rgb(164,185,160,0.6)] hover:-translate-y-px transition-all outline-none active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading && <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/>}
                        {isPublished ? "Aktualizuj" : "Opublikuj"}
                    </button>
                </div>
            </motion.div>

            <div className="bg-white dark:bg-[#1f1f1f] p-8 sm:p-16 lg:p-24 rounded-[3rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-beige-dark/10 dark:border-zinc-800 min-h-[800px]">
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl sm:text-5xl lg:text-6xl font-serif text-graphite dark:text-zinc-100 placeholder:text-graphite/20 dark:placeholder:text-zinc-700 border-none bg-transparent focus:outline-none focus:ring-0 p-0 mb-10 leading-tight transition-colors"
                    placeholder="Tytuł artykułu..."
                />

                <div className="w-16 h-1.5 bg-sage dark:bg-emerald-500 rounded-full mb-12 opacity-50" />

                <div className="prose prose-lg md:prose-xl dark:prose-invert prose-headings:font-serif prose-headings:text-graphite dark:prose-headings:text-zinc-100 prose-a:text-sage dark:prose-a:text-emerald-400 max-w-none text-graphite/80 dark:text-zinc-300">
                    <BlockEditor data={content} onChange={setContent} />
                </div>
            </div>
        </div>
    );
}
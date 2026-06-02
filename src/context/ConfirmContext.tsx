"use client";

import React, { createContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {TConfirmOptions} from "@/types/confirmContext";


type ConfirmContextType = (message: string, options?: TConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [options, setOptions] = useState<TConfirmOptions>({});

    const resolveRef = useRef<(value: boolean) => void>(() => {});

    const confirm = useCallback((msg: string, opts: TConfirmOptions = {}) => {
        setMessage(msg);
        setOptions({
            title: opts.title || "Wymagane potwierdzenie",
            confirmLabel: opts.confirmLabel || "Potwierdź",
            cancelLabel: opts.cancelLabel || "Anuluj",
            type: opts.type || "primary"
        });
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleCancel = () => {
        setIsOpen(false);
        resolveRef.current(false);
    };

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef.current(true);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCancel}
                            className="absolute inset-0 bg-graphite/10 dark:bg-black/40 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            transition={{ type: "spring", stiffness: 420, damping: 26 }}
                            className="relative w-full max-w-sm bg-white/90 dark:bg-[#262626]/90 backdrop-blur-2xl border border-white/40 dark:border-zinc-700/60 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] text-center overflow-hidden"
                        >
                            <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                                options.type === "danger"
                                    ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                                    : "bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400"
                            }`}>
                                {options.type === "danger" ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                )}
                            </div>

                            <h3 className="text-lg font-serif font-bold text-graphite dark:text-zinc-100 tracking-tight">
                                {options.title}
                            </h3>
                            <p className="mt-2.5 text-sm text-graphite/60 dark:text-zinc-400 leading-relaxed px-2">
                                {message}
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-3 bg-beige-light/30 border border-beige-dark/20 dark:bg-zinc-800 dark:border-zinc-700 text-graphite dark:text-zinc-300 font-bold text-sm rounded-xl transition-all hover:bg-beige-light/60 dark:hover:bg-zinc-700/80 active:scale-95"
                                >
                                    {options.cancelLabel}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all active:scale-95 text-white ${
                                        options.type === "danger"
                                            ? "bg-red-600 hover:bg-red-700 shadow-[0_4px_15px_rgb(220,38,38,0.2)]"
                                            : "bg-graphite dark:bg-zinc-100 dark:text-graphite shadow-md hover:bg-opacity-90"
                                    }`}
                                >
                                    {options.confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};
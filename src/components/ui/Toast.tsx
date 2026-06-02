import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {IToastProps} from "@/types/toast";

export const Toast = ({ toast, onClose }: IToastProps) => {
    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] w-max max-w-[90vw]"
                >
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl border cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                        toast.type === "success"
                            ? "bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-200/50 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                            : toast.type === "error"
                                ? "bg-red-50/90 dark:bg-red-950/80 border-red-200/50 dark:border-red-900/50 text-red-800 dark:text-red-300"
                                : "bg-white/90 dark:bg-zinc-800/90 border-beige-dark/30 dark:border-zinc-700/50 text-graphite dark:text-zinc-200"
                    }`}
                         onClick={onClose}
                    >
                        <div className="shrink-0">
                            {toast.type === "success" && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            {toast.type === "error" && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            )}
                        </div>

                        <span className="text-sm font-bold tracking-wide">
                            {toast.message}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
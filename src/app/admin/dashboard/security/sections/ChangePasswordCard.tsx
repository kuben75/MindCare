"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { itemVariants } from "@/framer-motion/animation-logs";
import InfoTooltip from "@/components/ui/InfoTooltip";

export default function ChangePasswordCard() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        if (newPassword.length < 8) {
            setStatusMessage({ text: "Nowe hasło musi zawierać minimum 8 znaków.", isError: true });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessage({ text: "Nowe hasła nie są identyczne.", isError: true });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/security/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                setStatusMessage({ text: data.error || "Nie udało się zmienić hasła.", isError: true });
            } else {
                setStatusMessage({ text: "Hasło zostało pomyślnie zaktualizowane!", isError: false });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            setStatusMessage({ text: "Błąd połączenia z serwerem.", isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="relative z-10 hover:z-[100] focus-within:z-[100] bg-white/60 dark:bg-[#262626]/60 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm transition-all duration-300"
        >
            <div className="flex gap-3 sm:gap-4 items-center mb-6 border-b border-beige-dark/10 dark:border-zinc-800 pb-4 sm:pb-5">
                <div className="p-2.5 sm:p-3 bg-beige-light/50 dark:bg-zinc-800 rounded-xl text-graphite/40 dark:text-zinc-500 shadow-sm border border-beige-dark/20 dark:border-zinc-700/50 shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-serif font-bold text-graphite dark:text-zinc-100">Zmiana Hasła</h3>
                        <InfoTooltip
                            title="Bezpieczeństwo logowania"
                            description="Ustaw własne, unikalne hasło (minimum 8 znaków). Po zmianie hasła Twoja obecna sesja pozostanie aktywna."
                        />
                    </div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-graphite/50 dark:text-zinc-400 mt-1">
                        Zarządzanie kluczem dostępu do konta
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                {statusMessage && (
                    <div
                        className={`p-3.5 rounded-xl text-xs font-semibold border ${
                            statusMessage.isError
                                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400"
                        }`}
                    >
                        {statusMessage.text}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-graphite/60 dark:text-zinc-400 mb-1.5">
                        Obecne hasło
                    </label>
                    <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-graphite dark:text-white text-sm focus:border-sage dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-graphite/60 dark:text-zinc-400 mb-1.5">
                            Nowe hasło
                        </label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 znaków"
                            className="w-full px-4 py-3 rounded-xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-graphite dark:text-white text-sm focus:border-sage dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-graphite/60 dark:text-zinc-400 mb-1.5">
                            Powtórz nowe hasło
                        </label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Powtórz hasło"
                            className="w-full px-4 py-3 rounded-xl border border-beige-dark/30 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-graphite dark:text-white text-sm focus:border-sage dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-graphite dark:bg-zinc-100 text-white dark:text-graphite hover:bg-opacity-90 transition-all hover:cursor-pointer disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isLoading && <span className="animate-spin w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />}
                        Zapisz nowe hasło
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
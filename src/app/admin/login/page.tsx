"use client";

import Link from "next/link";
import Image from "next/image";
import {motion, AnimatePresence} from "framer-motion";
import {useLoginPage} from "@/hooks/useLoginPage";
import {containerVariants, itemVariants} from "@/framer-motion/animation-login";

export default function AdminLoginPage() {
    const {
        email,
        setEmail,
        password,
        setPassword,
        error,
        isLoading,
        requires2FA,
        twoFactorCode,
        setTwoFactorCode,
        isRecoveryMode,
        setIsRecoveryMode,
        handleSubmit,
        handleRecoveryCodeChange,
        setError,
        setRequires2FA
    } = useLoginPage();


    return (
        <div
            className="min-h-screen bg-beige-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sage/20 rounded-full blur-[100px]"
                    animate={{x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1]}}
                    transition={{repeat: Infinity, duration: 15, ease: "easeInOut"}}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#d3cbb8]/40 rounded-full blur-[120px]"
                    animate={{x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.2, 1]}}
                    transition={{repeat: Infinity, duration: 20, ease: "easeInOut", delay: 1}}
                />
            </div>

            <motion.div className="w-full sm:max-w-md mx-auto relative z-10" variants={containerVariants}
                        initial="hidden" animate="visible">
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
                        <div
                            className="relative w-20 h-20 mx-auto shadow-sm rounded-3xl bg-white p-3 border border-beige-dark/10">
                            <Image src="/logo-icon.png" alt="Logo" fill className="object-contain p-2"/>
                        </div>
                    </Link>
                    <h2 className="mt-6 text-3xl font-serif text-graphite tracking-wide">
                        Witaj ponownie
                    </h2>
                    <p className="mt-2 text-sm text-graphite/60">
                        Zaloguj się do panelu zarządzania gabinetem.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <div
                        className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl shadow-sage/5 sm:rounded-3xl border border-white">

                        <form className="space-y-6" onSubmit={handleSubmit}>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{opacity: 0, height: 0, scale: 0.9}}
                                        animate={{opacity: 1, height: "auto", scale: 1}}
                                        exit={{opacity: 0, height: 0, scale: 0.9}}
                                        className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl text-center flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {!requires2FA ? (
                                    <motion.div key="login-step" initial={{opacity: 0, x: -20}}
                                                animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}}
                                                transition={{duration: 0.3}} className="space-y-5">
                                        <div>
                                            <label htmlFor="email"
                                                   className="block text-xs font-semibold uppercase tracking-wider text-graphite/60 mb-1.5 ml-1">Adres
                                                e-mail</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-graphite/30" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={1.5}
                                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                    </svg>
                                                </div>
                                                <input
                                                    id="email" type="email" required value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="block w-full pl-11 pr-4 py-3.5 bg-beige-light/30 border border-beige-dark/40 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage focus:bg-white text-graphite placeholder:text-graphite/30 transition-all sm:text-sm shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="password"
                                                   className="block text-xs font-semibold uppercase tracking-wider text-graphite/60 mb-1.5 ml-1">Hasło</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-graphite/30" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={1.5}
                                                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                                    </svg>
                                                </div>
                                                <input
                                                    id="password" type="password" required value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="block w-full pl-11 pr-4 py-3.5 bg-beige-light/30 border border-beige-dark/40 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage focus:bg-white text-graphite transition-all sm:text-sm shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : !isRecoveryMode ? (
                                    <motion.div key="2fa-step" initial={{opacity: 0, x: 20}}
                                                animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}}
                                                transition={{duration: 0.3}} className="space-y-6">
                                        <div className="text-center">
                                            <div
                                                className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-sage/5">
                                                <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-serif text-graphite">Weryfikacja dwuetapowa</h3>
                                            <p className="text-sm text-graphite/60 mt-2 px-4 leading-relaxed">Spójrz na
                                                swój telefon. Przepisz 6-cyfrowy kod z aplikacji Authenticator.</p>
                                        </div>
                                        <div>
                                            <input
                                                type="text" required maxLength={6} value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                                className="block w-full text-center tracking-[0.5em] text-3xl font-mono font-bold px-3 py-4 border-2 border-beige-dark/40 rounded-2xl shadow-inner placeholder-graphite/20 focus:outline-none focus:ring-sage focus:border-sage focus:bg-white bg-beige-light/20 transition-all text-graphite"
                                                placeholder="------" autoFocus
                                            />
                                        </div>

                                        <div className="flex flex-col items-center gap-3 pt-2">
                                            <button type="button" onClick={() => {
                                                setIsRecoveryMode(true);
                                                setTwoFactorCode("");
                                                setError("");
                                            }}
                                                    className="text-sm font-semibold text-sage hover:text-graphite transition-colors hover:cursor-pointer">
                                                Brak dostępu do telefonu? Użyj kodu zapasowego.
                                            </button>
                                            <button type="button" onClick={() => {
                                                setRequires2FA(false);
                                                setTwoFactorCode("");
                                                setError("");
                                            }}
                                                    className="text-xs font-semibold text-graphite/40 flex items-center gap-1.5 hover:text-graphite transition-colors hover:cursor-pointer">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                                                </svg>
                                                Wróć do wpisywania hasła
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="recovery-step" initial={{opacity: 0, x: 20}}
                                                animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}}
                                                transition={{duration: 0.3}} className="space-y-6">
                                        <div className="text-center">
                                            <div
                                                className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-amber-100">
                                                <svg className="w-8 h-8 text-amber-600" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-serif text-graphite">Odzyskiwanie dostępu</h3>
                                            <p className="text-sm text-graphite/60 mt-2 px-2 leading-relaxed">Wpisz
                                                jeden ze swoich jednorazowych kodów zapasowych.</p>
                                        </div>
                                        <div>
                                            <input
                                                type="text" required maxLength={9} value={twoFactorCode}
                                                onChange={handleRecoveryCodeChange}
                                                className="block w-full text-center tracking-widest text-2xl font-mono font-bold px-3 py-4 border-2 border-beige-dark/40 rounded-2xl shadow-inner placeholder-graphite/20 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:bg-white bg-beige-light/20 transition-all text-graphite uppercase"
                                                placeholder="XXXX-XXXX" autoFocus
                                            />
                                            <p className="text-[10px] text-center text-graphite/40 mt-3 font-semibold uppercase tracking-wider">Kod
                                                zostanie zablokowany po użyciu</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-3 pt-2">
                                            <button type="button" onClick={() => {
                                                setIsRecoveryMode(false);
                                                setTwoFactorCode("");
                                                setError("");
                                            }}
                                                    className="text-xs font-semibold text-graphite/40 flex items-center gap-1.5 hover:text-graphite transition-colors hover:cursor-pointer">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                                                </svg>
                                                Wróć do logowania aplikacją
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div variants={itemVariants} className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading || (requires2FA && !isRecoveryMode && twoFactorCode.length !== 6) || (isRecoveryMode && twoFactorCode.length !== 9)}
                                    className="relative overflow-hidden group w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-[0_8px_20px_rgba(164,185,160,0.3)] text-sm font-bold tracking-wide text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed bg-sage hover:bg-[#8ea38a] active:scale-[0.98]"
                                >
                                    <div
                                        className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"/>

                                    {isLoading ? (
                                        <svg className="animate-spin h-5 w-5 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : requires2FA ? "Potwierdź i wejdź" : "Zaloguj się"}
                                </button>
                            </motion.div>
                        </form>

                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
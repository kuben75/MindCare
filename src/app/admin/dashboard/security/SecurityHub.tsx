"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSecurityHub } from "@/hooks/useSecurityHub";
import { modalVariants, overlayVariants, slideVariants } from "@/framer-motion/animation-security";
import { Toast } from "@/components/ui/Toast";
import {containerVariants, itemVariants} from "@/framer-motion/animation-logs";

export default function SecurityHub({ is2FAEnabled, currentSessionId }: { is2FAEnabled: boolean, currentSessionId: string | null }) {
    const {
        activeTutorial, setActiveTutorial, tutorialStep, handleNext, handlePrev, closeTutorial,
        isEnabled, isLoading, qrCodeData, errorMessage, mobileOS, setMobileOS,
        verificationCode, setVerificationCode, handleVerifyAndEnable, handleDisable,
        recoveryCodes, isCopied, handleCopyCodes, activeSessions, isSessionsLoading, handleRevokeSession,
        toast, hideToast
    } = useSecurityHub({ is2FAEnabled });

    return (
        <motion.div className="relative space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <Toast toast={toast} onClose={hideToast}/>
            <motion.header variants={itemVariants} className="mb-10 max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Konto i Ochrona
                </p>
                <h1 className="text-3xl lg:text-4xl font-serif text-graphite dark:text-white tracking-wide leading-tight">
                    Centrum Bezpieczeństwa
                </h1>
                <p className="text-graphite/60 dark:text-zinc-400 text-sm mt-3 leading-relaxed font-medium">
                    Zarządzaj weryfikacją dwuetapową (2FA) oraz monitoruj urządzenia, z których logowano się do Twojego
                    panelu.
                </p>
            </motion.header>
            <motion.div variants={itemVariants}
                className="bg-white/60 dark:bg-[#262626]/60 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700 rounded-[2rem] p-6 lg:p-8 shadow-sm transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                    <div className="flex gap-5 items-start">
                        <div
                            className={`p-4 rounded-2xl shrink-0 transition-colors shadow-sm ${isEnabled ? 'bg-sage text-white dark:bg-emerald-500' : 'bg-beige-light/80 text-graphite/40 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-serif font-bold text-graphite dark:text-zinc-100 flex items-center gap-3">
                                Aplikacja Uwierzytelniająca (2FA)
                                {isEnabled && (
                                    <span
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400 border border-sage/20 dark:border-emerald-500/20 shadow-sm">
                                        Włączona
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm font-medium text-graphite/60 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
                                Zabezpiecz swoje konto aplikacją taką jak Google Authenticator. System poprosi o
                                jednorazowy, 6-cyfrowy kod z Twojego telefonu przy każdym logowaniu.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => isEnabled ? handleDisable() : setActiveTutorial('2FA')}
                        disabled={isLoading}
                        className={`px-8 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all hover:cursor-pointer whitespace-nowrap shadow-sm disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 ${
                            isEnabled
                                ? 'bg-white border-2 border-beige-dark/30 text-graphite hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-red-900/20 dark:hover:border-red-800'
                                : 'bg-graphite text-white dark:bg-zinc-100 dark:text-graphite shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5'
                        }`}
                    >
                        {isLoading ? <span
                            className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/> : null}
                        {isEnabled ? "Wyłącz 2FA" : "Skonfiguruj"}
                    </button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}
                className="bg-white/60 dark:bg-[#262626]/60 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700 rounded-[2rem] p-6 lg:p-8 shadow-sm">
                <div className="flex gap-4 items-center mb-8 border-b border-beige-dark/10 dark:border-zinc-800 pb-5">
                    <div
                        className="p-3 bg-beige-light/50 dark:bg-zinc-800 rounded-xl text-graphite/40 dark:text-zinc-500 shadow-sm border border-beige-dark/20 dark:border-zinc-700/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-serif font-bold text-graphite dark:text-zinc-100">Zarządzanie
                            urządzeniami</h3>
                        <p className="text-xs font-semibold uppercase tracking-widest text-graphite/50 dark:text-zinc-400 mt-1">Lista
                            aktywnych sesji logowania</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {isSessionsLoading ? (
                        <div
                            className="py-12 flex flex-col items-center justify-center text-graphite/40 dark:text-zinc-500 gap-3">
                            <span
                                className="animate-spin inline-block w-8 h-8 border-4 border-sage border-t-transparent rounded-full"></span>
                            <span className="text-sm font-semibold tracking-wide">Pobieranie listy urządzeń...</span>
                        </div>
                    ) : activeSessions.length === 0 ? (
                        <div className="py-12 text-center text-graphite/40 dark:text-zinc-500 text-sm font-medium">Brak
                            innych aktywnych sesji.</div>
                    ) : (
                        activeSessions.map((session) => {
                            const isCurrentSession = session.id === currentSessionId;
                            const isMobile = session.deviceInfo.includes("iOS") || session.deviceInfo.includes("Android");

                            return (
                                <motion.div layout key={session.id}
                                            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border-2 transition-all ${isCurrentSession ? 'bg-sage/5 border-sage/30 dark:bg-emerald-500/5 dark:border-emerald-500/30 shadow-sm' : 'bg-white dark:bg-zinc-800 border-beige-dark/20 dark:border-zinc-700 hover:border-beige-dark/40 dark:hover:border-zinc-600'}`}>
                                    <div className="flex items-center gap-5">
                                        <div
                                            className={`p-4 rounded-full border ${isCurrentSession ? 'bg-sage/10 border-sage/20 text-sage dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-beige-light/50 border-beige-dark/20 text-graphite/40 dark:bg-zinc-900/50 dark:border-zinc-700 dark:text-zinc-500'}`}>
                                            {isMobile ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <div
                                                className="font-bold text-graphite dark:text-zinc-200 text-[15px] flex items-center gap-3">
                                                {session.deviceInfo}
                                                {isCurrentSession && (
                                                    <span
                                                        className="px-2.5 py-1 bg-sage text-white text-[9px] uppercase tracking-widest rounded-lg font-bold">Obecne urządzenie</span>
                                                )}
                                            </div>
                                            <div
                                                className="text-[11px] font-bold text-graphite/40 dark:text-zinc-500 mt-1.5 flex flex-wrap items-center gap-3 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24"><path strokeLinecap="round"
                                                                                   strokeLinejoin="round"
                                                                                   strokeWidth={2}
                                                                                   d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path
                                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                    IP: {session.ipAddress}
                                                </span>
                                                <span className="hidden sm:inline opacity-30">•</span>
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24"><path strokeLinecap="round"
                                                                                   strokeLinejoin="round"
                                                                                   strokeWidth={2}
                                                                                   d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                    {new Date(session.createdAt).toLocaleDateString('pl-PL')} o {new Date(session.createdAt).toLocaleTimeString('pl-PL', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {!isCurrentSession && (
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            className="mt-4 sm:mt-0 w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-zinc-900 border-2 border-beige-dark/20 dark:border-zinc-700 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                            </svg>
                                            Wyloguj
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {activeTutorial === '2FA' && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-graphite/40 dark:bg-black/60 backdrop-blur-md"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <motion.div
                            className="bg-white dark:bg-[#1a1a1a] w-full max-w-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden relative border border-beige-dark/20 dark:border-zinc-800"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-beige-light/50 dark:bg-zinc-800">
                                <motion.div
                                    className="h-full bg-sage dark:bg-emerald-500 rounded-r-full"
                                    initial={{width: "20%"}}
                                    animate={{width: `${(tutorialStep / 5) * 100}%`}}
                                    transition={{duration: 0.4, ease: "easeInOut"}}
                                />
                            </div>

                            {tutorialStep < 5 && (
                                <button onClick={closeTutorial}
                                        className="absolute top-6 right-6 p-2 bg-beige-light/50 dark:bg-zinc-800 rounded-full text-graphite/40 dark:text-zinc-500 hover:text-graphite dark:hover:text-white transition-all hover:scale-110 active:scale-90 z-20">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                              d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            )}

                            <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
                                <AnimatePresence mode="wait" custom={1}>

                                    {tutorialStep === 1 && (
                                        <motion.div key="step1" variants={slideVariants} initial="enter"
                                                    animate="center" exit="exit"
                                                    className="flex-1 text-center flex flex-col items-center justify-center">
                                            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                                                <motion.div
                                                    className="absolute inset-0 bg-sage/10 dark:bg-emerald-500/10 rounded-full"
                                                    animate={{scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5]}}
                                                    transition={{repeat: Infinity, duration: 3, ease: "easeInOut"}}
                                                />
                                                <motion.div animate={{y: [0, -8, 0]}} transition={{
                                                    repeat: Infinity,
                                                    duration: 4,
                                                    ease: "easeInOut"
                                                }}>
                                                    <svg className="w-16 h-16 text-sage dark:text-emerald-400"
                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={1.5}
                                                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                                    </svg>
                                                </motion.div>
                                            </div>
                                            <h2 className="text-3xl font-serif text-graphite dark:text-white mb-4">Czym
                                                jest 2FA?</h2>
                                            <p className="text-graphite/70 dark:text-zinc-400 leading-relaxed text-sm max-w-sm">
                                                Twoje hasło to Twój klucz. 2FA (Logowanie dwuetapowe) to ochroniarz
                                                przed drzwiami. Nawet jeśli ktoś zdobędzie Twój klucz, nie wejdzie do
                                                gabinetu bez Twojego telefonu.
                                            </p>
                                        </motion.div>
                                    )}

                                    {tutorialStep === 2 && (
                                        <motion.div key="step2" variants={slideVariants} initial="enter"
                                                    animate="center" exit="exit"
                                                    className="flex-1 text-center flex flex-col items-center justify-center">
                                            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                                                <svg className="w-16 h-16 text-graphite/20 dark:text-zinc-600"
                                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                                </svg>
                                                <motion.div
                                                    className="absolute bg-white dark:bg-[#262626] border border-beige-dark/30 dark:border-zinc-700 shadow-xl rounded-xl px-4 py-2 font-mono text-base text-sage dark:text-emerald-400 font-bold"
                                                    animate={{opacity: [0, 1, 1, 0], y: [15, 0, 0, -15]}}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 3,
                                                        times: [0, 0.2, 0.8, 1]
                                                    }}
                                                >
                                                    834 291
                                                </motion.div>
                                            </div>
                                            <h2 className="text-3xl font-serif text-graphite dark:text-white mb-4">Zawsze
                                                unikalny kod</h2>
                                            <p className="text-graphite/70 dark:text-zinc-400 leading-relaxed text-sm max-w-sm">
                                                Zamiast polegać na SMS-ach, użyjemy specjalnej aplikacji. Generuje ona
                                                nowy, bezpieczny 6-cyfrowy kod co 30 sekund. Działa również offline!
                                            </p>
                                        </motion.div>
                                    )}

                                    {tutorialStep === 3 && (
                                        <motion.div key="step3" variants={slideVariants} initial="enter"
                                                    animate="center" exit="exit"
                                                    className="flex-1 flex flex-col w-full justify-center">
                                            <div className="text-center mb-8">
                                                <h2 className="text-3xl font-serif text-graphite dark:text-white mb-3">Zainstaluj
                                                    aplikację</h2>
                                                <p className="text-graphite/60 dark:text-zinc-400 text-sm">Wybierz swój
                                                    system operacyjny, aby zobaczyć instrukcję.</p>
                                            </div>

                                            <div
                                                className="flex bg-beige-light/50 dark:bg-zinc-800/80 p-1.5 rounded-2xl mb-8 shadow-inner border border-beige-dark/10 dark:border-zinc-700">
                                                <button onClick={() => setMobileOS('ios')}
                                                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${mobileOS === 'ios' ? 'bg-white dark:bg-[#333] text-graphite dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'text-graphite/40 dark:text-zinc-500 hover:text-graphite dark:hover:text-white'}`}>
                                                    <svg className="w-4 h-4" viewBox="0 0 384 512" fill="currentColor">
                                                        <path
                                                            d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                                                    </svg>
                                                    iPhone
                                                </button>
                                                <button onClick={() => setMobileOS('android')}
                                                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${mobileOS === 'android' ? 'bg-white dark:bg-[#333] text-graphite dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'text-graphite/40 dark:text-zinc-500 hover:text-graphite dark:hover:text-white'}`}>
                                                    <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                                                        <path
                                                            d="M325.3 234.3c-13.7 0-24.9-11.2-24.9-24.9s11.2-24.9 24.9-24.9 24.9 11.2 24.9 24.9-11.2 24.9-24.9 24.9zm-138.6 0c-13.7 0-24.9-11.2-24.9-24.9s11.2-24.9 24.9-24.9 24.9 11.2 24.9 24.9-11.2 24.9-24.9 24.9zm130.6-121.1l26.6-46.1c2-3.5 .8-8-2.7-10-3.5-2-8-.8-10 2.7l-27.1 46.9C278.4 93.6 247 88 213.3 88s-65.1 5.6-94.2 16.6l-27.1-46.9c-2-3.5-6.5-4.7-10-2.7-3.5 2-4.7 6.5-2.7 10l26.6 46.1C47.5 152.9 5.3 226.7 0 312h426.7c-5.3-85.3-47.5-159.1-109.4-200.8z"/>
                                                    </svg>
                                                    Android
                                                </button>
                                            </div>

                                            <ul className="space-y-5 text-sm text-graphite/80 dark:text-zinc-300 px-4">
                                                <motion.li initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}}
                                                           transition={{delay: 0.1}} className="flex items-start gap-4">
                                                    <span
                                                        className="w-6 h-6 rounded-full bg-sage/20 text-sage dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                                                    <span className="leading-relaxed">Otwórz sklep <strong
                                                        className="text-graphite dark:text-zinc-100">{mobileOS === 'ios' ? 'App Store' : 'Google Play Store'}</strong> na telefonie.</span>
                                                </motion.li>
                                                <motion.li initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}}
                                                           transition={{delay: 0.2}} className="flex items-start gap-4">
                                                    <span
                                                        className="w-6 h-6 rounded-full bg-sage/20 text-sage dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                                                    <span
                                                        className="leading-relaxed">Wyszukaj i pobierz aplikację <strong
                                                        className="text-graphite dark:text-zinc-100">Google Authenticator</strong>.</span>
                                                </motion.li>
                                                <motion.li initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}}
                                                           transition={{delay: 0.3}} className="flex items-start gap-4">
                                                    <span
                                                        className="w-6 h-6 rounded-full bg-sage/20 text-sage dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                                                    <span className="leading-relaxed">Otwórz aplikację, przygotuj się i kliknij przycisk <strong
                                                        className="text-graphite dark:text-zinc-100">Skanuj kod QR</strong>.</span>
                                                </motion.li>
                                            </ul>
                                        </motion.div>
                                    )}

                                    {tutorialStep === 4 && (
                                        <motion.div key="step4" variants={slideVariants} initial="enter"
                                                    animate="center" exit="exit"
                                                    className="flex-1 flex flex-col items-center justify-center w-full">
                                            <h2 className="text-2xl font-serif text-graphite dark:text-white mb-2">Zeskanuj
                                                i połącz</h2>
                                            <p className="text-graphite/60 dark:text-zinc-400 text-sm mb-8 text-center max-w-sm">
                                                Zeskanuj poniższy kod aparatem telefonu przez aplikację, a następnie
                                                przepisz wyświetlony na ekranie kod.
                                            </p>

                                            <div
                                                className="w-48 h-48 bg-white p-3 rounded-3xl shadow-lg border border-beige-dark/20 flex items-center justify-center mb-6 relative overflow-hidden group">
                                                <motion.div
                                                    className="absolute left-0 right-0 h-1 bg-sage dark:bg-emerald-400 shadow-[0_0_15px_4px_rgba(143,155,140,0.6)] z-10"
                                                    animate={{top: ['5%', '95%', '5%']}}
                                                    transition={{repeat: Infinity, duration: 2.5, ease: "linear"}}
                                                />
                                                {qrCodeData ? (
                                                    <img src={qrCodeData} alt="Kod QR 2FA"
                                                         className="w-full h-full object-contain relative z-0 rounded-xl"/>
                                                ) : (
                                                    <span
                                                        className="animate-spin w-8 h-8 border-4 border-sage border-t-transparent rounded-full"/>
                                                )}
                                            </div>

                                            {errorMessage && (
                                                <div
                                                    className="text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-xl text-xs font-bold mb-4 text-center animate-fade-in w-full max-w-[280px]">
                                                    {errorMessage}
                                                </div>
                                            )}

                                            <div className="w-full max-w-[280px]">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="• • • • • •"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold px-4 py-4 rounded-2xl border-2 border-beige-dark/30 dark:border-zinc-700 bg-beige-light/10 dark:bg-zinc-800 text-graphite dark:text-white focus:border-sage dark:focus:border-emerald-500 focus:ring-4 focus:ring-sage/20 dark:focus:ring-emerald-500/20 focus:outline-none transition-all placeholder-graphite/20 dark:placeholder-zinc-600 shadow-inner"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {tutorialStep === 5 && (
                                        <motion.div key="step5" variants={slideVariants} initial="enter"
                                                    animate="center" exit="exit"
                                                    className="flex-1 flex flex-col w-full text-center justify-center">
                                            <div
                                                className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200 dark:border-amber-500/20 shadow-sm rotate-3">
                                                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                                </svg>
                                            </div>
                                            <h2 className="text-3xl font-serif text-graphite dark:text-white mb-3">Zapisz
                                                kody zapasowe!</h2>
                                            <p className="text-graphite/60 dark:text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                                                Jeśli stracisz dostęp do telefonu, kody te będą JEDYNYM SPOSOBEM na
                                                zalogowanie się do Twojego panelu. Każdy kod działa tylko <strong
                                                className="text-graphite dark:text-zinc-200">JEDEN RAZ</strong>.
                                            </p>

                                            <div
                                                className="grid grid-cols-2 gap-3 bg-beige-light/50 dark:bg-zinc-900 border border-beige-dark/30 dark:border-zinc-800 rounded-3xl p-5 max-w-sm mx-auto mb-8 font-mono text-sm font-bold text-graphite/80 dark:text-zinc-300 shadow-inner">
                                                {recoveryCodes.map((code, index) => (
                                                    <div key={index}
                                                         className="flex justify-between items-center px-4 py-2.5 bg-white dark:bg-[#262626] border border-beige-dark/20 dark:border-zinc-700 rounded-xl shadow-sm">
                                                        <span
                                                            className="text-graphite/30 dark:text-zinc-600 font-sans text-xs">{index + 1}.</span>
                                                        <span className="tracking-widest select-all">{code}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={handleCopyCodes}
                                                className={`mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm border active:scale-95 hover:cursor-pointer ${
                                                    isCopied
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                                                        : 'bg-white border-beige-dark/30 text-graphite hover:bg-beige-light dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                                }`}
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={3} d="M5 13l4 4L19 7"/>
                                                        </svg>
                                                        Skopiowano do schowka!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 text-graphite/40 dark:text-zinc-500"
                                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2.5}
                                                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                                        </svg>
                                                        Skopiuj wszystkie kody
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    )}

                                </AnimatePresence>

                                <div
                                    className="mt-8 pt-6 border-t border-beige-dark/20 dark:border-zinc-800 flex justify-between items-center">
                                    {tutorialStep > 1 && tutorialStep < 5 ? (
                                        <button onClick={handlePrev} disabled={isLoading}
                                                className="text-xs font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 hover:text-graphite dark:hover:text-white transition-colors hover:cursor-pointer disabled:opacity-50 px-4 py-2">
                                            Wstecz
                                        </button>
                                    ) : (
                                        <div/>
                                    )}

                                    {tutorialStep < 4 ? (
                                        <button onClick={handleNext}
                                                className="px-8 py-3.5 bg-graphite dark:bg-zinc-200 text-white dark:text-graphite rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all hover:cursor-pointer shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:scale-95">
                                            Dalej
                                        </button>
                                    ) : tutorialStep === 4 ? (
                                        <button onClick={handleVerifyAndEnable}
                                                disabled={isLoading || verificationCode.length !== 6}
                                                className="px-8 py-3.5 bg-sage text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all hover:cursor-pointer shadow-[0_8px_20px_rgba(164,185,160,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                                            {isLoading ? <span
                                                className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : null}
                                            Zakończ i włącz
                                        </button>
                                    ) : (
                                        <button onClick={closeTutorial}
                                                className="px-10 py-4 bg-graphite dark:bg-zinc-200 text-white dark:text-graphite rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all hover:cursor-pointer shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto text-center">
                                            Kody zapisane, zamknij
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
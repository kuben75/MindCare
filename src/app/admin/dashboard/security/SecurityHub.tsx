"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSecurityHub } from "@/hooks/useSecurityHub";
import { Toast } from "@/components/ui/Toast";
import { containerVariants, itemVariants } from "@/framer-motion/animation-logs";
import InfoTooltip from "@/components/ui/InfoTooltip";
import ActiveSessionsList from "./sections/ActiveSessionsList";
import SecurityTutorialModal from "./sections/SecurityTutorialModal";
import ChangePasswordCard from "./sections/ChangePasswordCard";

export default function SecurityHub({ is2FAEnabled, currentSessionId }: { is2FAEnabled: boolean, currentSessionId: string | null }) {
    const {
        activeTutorial, setActiveTutorial, tutorialStep, handleNext, handlePrev, closeTutorial,
        isEnabled, isLoading, qrCodeData, errorMessage, mobileOS, setMobileOS,
        verificationCode, setVerificationCode, handleVerifyAndEnable, handleDisable,
        recoveryCodes, isCopied, handleCopyCodes, activeSessions, isSessionsLoading, handleRevokeSession,
        toast, hideToast
    } = useSecurityHub({ is2FAEnabled });

    return (
        <motion.div className="relative space-y-6 sm:space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            <Toast toast={toast} onClose={hideToast}/>

            <motion.header variants={itemVariants} className="mb-6 sm:mb-10 max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Konto i Ochrona
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-graphite dark:text-white tracking-wide leading-tight">
                    Centrum Bezpieczeństwa
                </h1>
                <p className="text-graphite/60 dark:text-zinc-400 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed font-medium">
                    Zarządzaj weryfikacją dwuetapową (2FA) oraz monitoruj urządzenia, z których logowano się do Twojego panelu.
                </p>
            </motion.header>

            <motion.div variants={itemVariants} className="relative z-10 hover:z-[100] focus-within:z-[100] bg-white/60 dark:bg-[#262626]/60 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center justify-between">
                    <div className="flex gap-4 sm:gap-5 items-start min-w-0">
                        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 transition-colors shadow-sm ${isEnabled ? 'bg-sage text-white dark:bg-emerald-500' : 'bg-beige-light/80 text-graphite/40 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h3 className="text-base sm:text-lg font-serif font-bold text-graphite dark:text-zinc-100 flex flex-wrap items-center gap-2">
                                    <span>Aplikacja Uwierzytelniająca (2FA)</span>
                                    {isEnabled && (
                                        <span className="px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400 border border-sage/20 dark:border-emerald-500/20 shadow-sm shrink-0">
                                            Włączona
                                        </span>
                                    )}
                                </h3>
                                <InfoTooltip
                                    title="Standard ochrony medycznej"
                                    description="Włączenie 2FA chroni niezwykle wrażliwe dane Twoich pacjentów. Nawet w przypadku kradzieży lub wycieku Twojego hasła, atakujący nie dostanie się do systemu bez fizycznego dostępu do Twojego telefonu."
                                />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-graphite/60 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
                                Zabezpiecz swoje konto aplikacją taką jak Google Authenticator. System poprosi o jednorazowy kod z telefonu przy każdym logowaniu.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => isEnabled ? handleDisable() : setActiveTutorial('2FA')}
                        disabled={isLoading}
                        className={`w-full md:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all hover:cursor-pointer whitespace-nowrap shadow-sm disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 shrink-0 ${
                            isEnabled
                                ? 'bg-white border-2 border-beige-dark/30 text-graphite hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-red-900/20 dark:hover:border-red-800'
                                : 'bg-graphite text-white dark:bg-zinc-100 dark:text-graphite shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5'
                        }`}
                    >
                        {isLoading ? <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/> : null}
                        {isEnabled ? "Wyłącz 2FA" : "Skonfiguruj"}
                    </button>
                </div>
            </motion.div>

            <ChangePasswordCard />

            <motion.div variants={itemVariants} className="relative z-10 hover:z-[100] focus-within:z-[100] bg-white/60 dark:bg-[#262626]/60 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm">
                <div className="flex gap-3 sm:gap-4 items-center mb-6 sm:mb-8 border-b border-beige-dark/10 dark:border-zinc-800 pb-4 sm:pb-5">
                    <div className="p-2.5 sm:p-3 bg-beige-light/50 dark:bg-zinc-800 rounded-xl text-graphite/40 dark:text-zinc-500 shadow-sm border border-beige-dark/20 dark:border-zinc-700/50 shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-serif font-bold text-graphite dark:text-zinc-100">Zarządzanie urządzeniami</h3>
                            <InfoTooltip
                                title="Zdalne wylogowywanie"
                                description="Widzisz tu wszystkie telefony i komputery, które są obecnie zalogowane do Twojego panelu. Jeśli np. zalogowałaś się na komputerze w innym gabinecie i zapomniałaś się wylogować, kliknij 'Wyloguj', aby natychmiastowo odciąć im dostęp."
                            />
                        </div>
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-graphite/50 dark:text-zinc-400 mt-1">Lista aktywnych sesji logowania</p>
                    </div>
                </div>

                <ActiveSessionsList
                    activeSessions={activeSessions}
                    isSessionsLoading={isSessionsLoading}
                    currentSessionId={currentSessionId}
                    handleRevokeSession={handleRevokeSession}
                />
            </motion.div>

            <AnimatePresence>
                <SecurityTutorialModal
                    activeTutorial={activeTutorial}
                    tutorialStep={tutorialStep}
                    closeTutorial={closeTutorial}
                    mobileOS={mobileOS}
                    setMobileOS={setMobileOS}
                    qrCodeData={qrCodeData}
                    errorMessage={errorMessage}
                    verificationCode={verificationCode}
                    setVerificationCode={setVerificationCode}
                    recoveryCodes={recoveryCodes}
                    isCopied={isCopied}
                    handleCopyCodes={handleCopyCodes}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                    handleVerifyAndEnable={handleVerifyAndEnable}
                    isLoading={isLoading}
                />
            </AnimatePresence>
        </motion.div>
    );
}
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IInfoTooltipProps } from "@/types/settings";
import {useInfoTooltip} from "@/hooks/useInfoTooltip";
import Image from "next/image";

export default function InfoTooltip({ title, description, images }: IInfoTooltipProps) {
const {
    buttonRef,
    isVisible,
    lightboxImage,
    setLightboxImage,
    mounted,
    isMobile,
    placement,
    handleMouseEnter,
    handleMouseLeave,
    toggleVisibility,
    setIsVisible
} = useInfoTooltip();

    const TooltipContent = () => (
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <div className="flex-1">
                <h4 className="text-[17px] sm:text-[19px] font-bold text-graphite dark:text-white mb-3 tracking-tight flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sage/10 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-sage dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    {title}
                </h4>
                <p className="text-[14px] sm:text-[15px] font-medium text-graphite/70 dark:text-zinc-400 leading-relaxed">
                    {description}
                </p>
            </div>

            {images && images.length > 0 && (
                <div className="w-full sm:w-[240px] shrink-0 flex flex-col gap-3">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setLightboxImage(img)}
                            className="relative aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] cursor-zoom-in group shadow-inner"
                        >
                            <Image fill
                                src={img}
                                alt={`Podgląd funkcji ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div
                                className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <div
                                    className="bg-white/90 dark:bg-zinc-800/90 text-graphite dark:text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                                    </svg>
                                    Powiększ
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <div
                className="relative flex items-center group ml-3"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleVisibility}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-b from-white to-beige-light/50 dark:from-zinc-800 dark:to-zinc-900 border border-beige-dark/60 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-sage/50 dark:hover:border-emerald-500/50 transition-all duration-300 focus:outline-none z-10 overflow-hidden"
                    aria-expanded={isVisible}
                >
                    <div
                        className="absolute inset-0 bg-sage/10 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="w-3.5 h-3.5 text-sage dark:text-emerald-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-graphite/80 dark:text-zinc-300 relative z-10 mt-[1px]">
                        Jak to działa?
                    </span>
                </button>

                {!isMobile && (
                    <AnimatePresence>
                        {isVisible && (
                            <motion.div
                                initial={{ opacity: 0, y: placement === 'top' ? 15 : -15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: placement === 'top' ? 10 : -10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                style={{ originY: placement === 'top' ? 1 : 0, originX: 0.5 }}
                                className={`absolute z-[100] left-1/2 -translate-x-1/2 pointer-events-auto w-[480px] lg:w-[640px]
                                    ${placement === 'top' ? 'bottom-full mb-3 pb-3' : 'top-full mt-3 pt-3'}
                                `}
                            >
                                <div className="relative overflow-hidden bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-3xl border border-white/40 dark:border-zinc-700/50 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-black/5 dark:ring-white/10">
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sage/5 dark:from-emerald-500/10 to-transparent pointer-events-none"></div>
                                    <div className="relative p-6 sm:p-8">
                                        {TooltipContent()}
                                    </div>
                                </div>

                                {placement === 'top' ? (
                                    <div className="absolute top-[100%] left-1/2 -translate-x-1/2 -mt-[20px] w-5 h-5 bg-white dark:bg-[#18181b] border-b border-r border-white/40 dark:border-zinc-700/50 rotate-45 transform origin-center shadow-[4px_4px_10px_rgba(0,0,0,0.05)] rounded-sm"></div>
                                ) : (
                                    <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 -mb-[20px] w-5 h-5 bg-white dark:bg-[#18181b] border-t border-l border-white/40 dark:border-zinc-700/50 rotate-45 transform origin-center shadow-[-4px_-4px_10px_rgba(0,0,0,0.05)] rounded-sm"></div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {mounted && isMobile && createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <div className="fixed inset-0 z-[90000] flex items-end sm:hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsVisible(false)}
                                className="absolute inset-0 bg-graphite/40 dark:bg-black/60 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: "0%" }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="relative w-full bg-white dark:bg-zinc-900 rounded-t-[2rem] p-6 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-black/5 dark:border-white/10 max-h-[85vh] overflow-y-auto"
                            >
                                <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mb-6"></div>

                                {TooltipContent()}

                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="mt-8 w-full py-4 bg-beige-light dark:bg-zinc-800 rounded-xl font-bold text-graphite dark:text-zinc-200"
                                >
                                    Zamknij
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {mounted && createPortal(
                <AnimatePresence>
                    {lightboxImage && (
                        <motion.div
                            initial={{opacity: 0, backdropFilter: "blur(0px)"}}
                            animate={{opacity: 1, backdropFilter: "blur(12px)"}}
                            exit={{opacity: 0, backdropFilter: "blur(0px)"}}
                            transition={{duration: 0.3}}
                            className="fixed inset-0 z-[99999] flex items-center justify-center bg-graphite/40 dark:bg-black/80 p-4 sm:p-10 cursor-zoom-out"
                            onClick={() => setLightboxImage(null)}
                        >
                            <motion.img
                                initial={{scale: 0.9, y: 30}}
                                animate={{scale: 1, y: 0}}
                                exit={{scale: 0.95, y: 20}}
                                transition={{type: "spring", damping: 25, stiffness: 250}}
                                src={lightboxImage}
                                alt="Powiększony podgląd"
                                className="max-w-full max-h-full rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] border border-white/20 cursor-default object-contain transform-gpu antialiased"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={() => setLightboxImage(null)}
                                className="absolute top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
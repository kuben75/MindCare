import {motion} from "framer-motion";
import {itemVariants} from "@/framer-motion/animation-dashboard";
import Link from "next/link";
import React from "react";

export const AlertBox = ({ count }: { count: number }) => (
    <motion.div variants={itemVariants} className="bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-zinc-900 border border-red-200 dark:border-red-900/50 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110" />
        <div className="flex items-start gap-4 relative z-10">
            <div className="relative mt-1">
                <div className="absolute inset-0 bg-red-400 rounded-full  opacity-20" />
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center relative shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-red-800 dark:text-red-400 text-sm tracking-wide">Wymagana interwencja</h3>
                <p className="text-red-700/80 dark:text-red-400/80 text-sm mt-1.5 leading-relaxed pr-4">
                    Poczekalnia: Masz <strong>{count}</strong> {count === 1 ? "prośbę" : "próśb"} o zmianę terminu wizyty.
                </p>
                <Link href="/admin/dashboard/reservations" className="inline-flex mt-4 items-center gap-1.5 text-xs font-bold text-white bg-red-600 dark:bg-red-500/20 dark:text-red-400 px-4 py-2 rounded-lg shadow-sm hover:bg-red-700 dark:hover:bg-red-500/30 transition-colors">
                    Rozwiąż teraz <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
            </div>
        </div>
    </motion.div>
);
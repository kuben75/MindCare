import React from "react";
import {motion} from "framer-motion";
import {itemVariants} from "@/framer-motion/animation-dashboard";

export const StatCard = ({ icon, label, value, subLabel, isAlert = false }: { icon: React.ReactNode, label: string, value: number, subLabel: string, isAlert?: boolean }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ y: -4 }}
        className={`relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 group ${
            isAlert
                ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-[0_8px_30px_rgb(245,158,11,0.1)] dark:from-amber-950/30 dark:to-zinc-900 dark:border-amber-900/50'
                : 'bg-white border-beige-dark/20 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:bg-[#262626] dark:border-zinc-700/80 hover:shadow-[0_8px_30px_rgb(164,185,160,0.15)] dark:hover:border-emerald-500/30'
        }`}
    >
        <div className="flex items-center gap-4 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-3 ${
                isAlert ? 'bg-amber-100/80 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-sage/10 text-sage dark:bg-emerald-500/10 dark:text-emerald-400'
            }`}>
                {icon}
            </div>
            <div>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${isAlert ? 'text-amber-700/70 dark:text-amber-500/70' : 'text-graphite/40 dark:text-zinc-500'}`}>
                    {label}
                </p>
                <p className={`text-3xl font-serif leading-none mt-1.5 ${isAlert ? 'text-amber-700 dark:text-amber-400' : 'text-graphite dark:text-zinc-100'}`}>
                    {value} <span className="text-sm font-sans font-medium opacity-50 tracking-normal">{subLabel}</span>
                </p>
            </div>
        </div>
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-50 transition-opacity group-hover:opacity-100 ${isAlert ? 'bg-amber-200 dark:bg-amber-900/30' : 'bg-sage/20 dark:bg-emerald-900/20'}`} />
    </motion.div>
);
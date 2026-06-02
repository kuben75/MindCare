import React from "react";
import { motion } from "framer-motion";
import {StatusBarProps} from "@/types/finances";
import {STATUS_STYLES} from "@/constants/StatusBar";


export function StatusBar({ label, count, total, color }: StatusBarProps) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const styles = STATUS_STYLES[color];

    return (
        <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.bg}`}>
            <div className="flex items-end justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-600">
                    {label}
                </span>
                <span className={`text-2xl font-serif font-bold leading-none tabular-nums ${styles.num}`}>
                    {count}
                </span>
            </div>

            <div
                className="h-1 w-full bg-beige-dark/15 dark:bg-zinc-800 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Procent ${label.toLowerCase()}`}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${styles.bar}`}
                />
            </div>

            <span className="text-[10px] font-semibold text-graphite/30 dark:text-zinc-700 mt-2 block tabular-nums">
                {pct}% wszystkich wizyt
            </span>
        </div>
    );
}
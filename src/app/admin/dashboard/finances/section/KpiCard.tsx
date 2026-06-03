import React from "react";
import { KpiCardProps } from "@/types/finances";
import InfoTooltip from "@/components/ui/InfoTooltip";


export function KpiCard({ label, value, sub, icon, tooltipTitle, tooltipDesc }: KpiCardProps & { tooltipTitle?: string; tooltipDesc?: string }) {
    return (
        <div className="bg-white dark:bg-[#262626] border border-beige-dark/20 dark:border-zinc-700 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">
                        {label}
                    </h3>
                    {tooltipTitle && tooltipDesc && (
                        <InfoTooltip title={tooltipTitle} description={tooltipDesc} />
                    )}
                </div>
                <div className="w-8 h-8 ml-4 rounded-xl bg-beige-light/50 dark:bg-zinc-800 flex items-center justify-center text-graphite/40 dark:text-zinc-500 group-hover:text-sage dark:group-hover:text-emerald-400 transition-colors duration-200">
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-2xl font-serif text-graphite dark:text-zinc-100 leading-none tabular-nums">
                    {value}
                </p>
                <p className="text-[11px] font-medium text-graphite/40 dark:text-zinc-600 mt-1.5 leading-snug">
                    {sub}
                </p>
            </div>
        </div>
    );
}
import React from "react";

export const StatItem = ({ label, value, dotColor }: { label: string, value: number, dotColor: string }) => (
    <div className="flex flex-col lg:items-center justify-center gap-1">
        <span className="text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {label}
        </span>
        <span className="text-lg font-serif font-bold text-graphite dark:text-zinc-100 tabular-nums lg:pl-0 pl-3">
            {value}
        </span>
    </div>
);
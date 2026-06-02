import React from "react";
import Link from "next/link";

export const ShortcutLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
    <Link href={href} className="group relative p-4 bg-white dark:bg-[#262626] border border-beige-dark/20 dark:border-zinc-700/80 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sage/5 hover:border-sage/30 overflow-hidden flex flex-col items-start">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="w-10 h-10 rounded-xl bg-beige-light/50 dark:bg-zinc-800 text-graphite/40 dark:text-zinc-400 flex items-center justify-center mb-3 group-hover:bg-sage/10 group-hover:text-sage dark:group-hover:text-emerald-400 transition-colors relative z-10">
            {icon}
        </div>
        <span className="block text-sm font-semibold text-graphite dark:text-zinc-200 relative z-10">{label}</span>
    </Link>
);
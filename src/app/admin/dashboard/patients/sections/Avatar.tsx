import React from "react";

export const Avatar = ({ name }: { name: string }) => {
    const initials = name
        .split(" ")
        .map(n => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-beige-light to-beige-dark/40 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shrink-0 shadow-inner border border-white/50 dark:border-zinc-600/50">
            <span className="text-sm font-bold text-graphite/80 dark:text-zinc-200 tracking-wider">
                {initials}
            </span>
        </div>
    );
};
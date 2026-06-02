"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-16 h-8 rounded-full bg-beige-dark/50 dark:bg-slate-800 animate-pulse"></div>;
    }

    const isDark = resolvedTheme === "dark" || theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`  relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 dark:focus:ring-offset-[#1a1a1a] hover:cursor-pointer ${isDark ? 'bg-slate-700' : 'bg-beige-dark/70 hover:bg-beige-dark'}
            `}
            aria-label="Przełącz tryb"
            title={isDark ? "Włącz tryb jasny" : "Włącz tryb ciemny"}
        >
            <span className="sr-only">Przełącz tryb ciemny</span>

            <span
                className={`
                    relative flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out
                    ${isDark ? 'translate-x-9' : 'translate-x-1'}
                `}
            >
                <svg
                    className={`absolute w-4 h-4 text-amber-500 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`}
                    fill="currentColor" viewBox="0 0 20 20"
                >
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>

                <svg
                    className={`absolute w-4 h-4 text-slate-700 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}
                    fill="currentColor" viewBox="0 0 20 20"
                >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            </span>
        </button>
    );
}
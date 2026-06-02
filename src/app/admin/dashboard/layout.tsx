"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {MENU_ITEMS} from "@/constants/adminLayout";
import {ThemeProvider} from "next-themes";
import {ThemeToggle} from "@/app/admin/ThemeToggle";
import {ConfirmProvider} from "@/context/ConfirmContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <ConfirmProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
            <div className="min-h-screen bg-beige-light/30 flex dark:bg-[#1a1a1a] transition-colors duration-300">
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-graphite/50 z-40 md:hidden transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-beige-dark/20 shadow-xl md:shadow-none
                    dark:bg-[#262626] dark:border-zinc-600 transition-colors duration-300
                    transform ease-in-out md:relative md:translate-x-0
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    flex flex-col
                `}>
                    <div className="h-16 flex items-center px-6 border-b border-beige-dark/20 dark:border-zinc-600">
                        <span className="text-sage font-serif text-xl tracking-wide dark:text-zinc-200">Menu</span>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {MENU_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                                        ${isActive
                                        ? "bg-sage text-white shadow-md dark:bg-sage/80" 
                                        : "text-graphite/70 hover:bg-beige-light/50 hover:text-graphite dark:text-zinc-200 dark:hover:bg-slate-800 dark:hover:text-gray-100" 
                                    }
                                    `}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-beige-dark/20 dark:border-zinc-600">
                        <button
                            onClick={() => signOut({ callbackUrl: "/admin/login" })}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Wyloguj się
                        </button>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <header className="h-16 bg-white border-b border-beige-dark/20 dark:bg-[#262626] dark:border-zinc-600 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors duration-300">
                        <span className="text-graphite font-serif text-lg md:hidden dark:text-gray-100">Panel</span>

                        <div className="hidden md:block"></div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />

                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 text-graphite/70 hover:text-sage focus:outline-none md:hidden dark:text-gray-400 dark:hover:text-sage"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ThemeProvider>
        </ConfirmProvider>
    );
}
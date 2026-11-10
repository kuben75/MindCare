"use client";

import Link from "next/link";
import Image from "next/image";
import { useNavbar } from "@/hooks/useNavbar";

export const Navbar = () => {
    const {
        isOpen,
        setIsOpen,
        scrolled,
        settings,
        isAdmin
    } = useNavbar();

    if (isAdmin) {
        return null;
    }

    return (
        <>
            <nav className={`w-full fixed top-0 left-0 right-0 z-[120] transition-all duration-300 ${
                scrolled
                    ? "bg-beige-light/95 backdrop-blur-md shadow-sm py-2.5 border-b border-beige-dark/20"
                    : "bg-beige-light border-b border-beige-dark/30 py-3.5 md:py-6"
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center transition-all duration-300">

                    <div className="flex-1 flex justify-start items-center min-w-0 pr-2">
                        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
                                <Image
                                    src="/logo-icon.png"
                                    alt="Logo"
                                    fill
                                    sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, 48px"
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            <span className="text-xs sm:text-sm md:text-xl tracking-wider md:tracking-widest text-graphite uppercase font-semibold group-hover:text-sage transition-colors truncate">
                                {settings?.clinicName || "Paulina Kawka-Mirek"}
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex flex-1 justify-center gap-8 items-center text-graphite font-medium">
                        <Link href="/#o-mnie" className="hover:text-sage transition-colors">O mnie</Link>
                        <Link href="/#specjalizacja" className="hover:text-sage transition-colors">Specjalizacja</Link>
                        <Link href="/blog" className="hover:text-sage transition-colors">Blog</Link>
                        <Link href="/#kontakt" className="hover:text-sage transition-colors">Kontakt</Link>
                    </div>

                    <div className="hidden md:flex flex-1 justify-end">
                        <Link
                            href="#kalendarz"
                            className="bg-sage text-white px-6 py-2.5 rounded-xl hover:bg-[#8ea38a] transition-all text-sm tracking-wide font-semibold shadow-sm active:scale-95"
                        >
                            Umów wizytę
                        </Link>
                    </div>

                    <button
                        className="md:hidden text-graphite p-2 -mr-1 focus:outline-none shrink-0"
                        onClick={() => setIsOpen(true)}
                        aria-label="Otwórz menu"
                    >
                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            <div
                className={`md:hidden fixed inset-0 bg-graphite/50 backdrop-blur-sm transition-opacity duration-300 z-[130] ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`md:hidden fixed top-0 right-0 h-screen w-[80%] max-w-[320px] bg-beige-light shadow-2xl z-[140] transform transition-transform duration-300 ease-in-out flex flex-col p-6 border-l border-beige-dark/30 ${
                isOpen ? "translate-x-0" : "translate-x-full"
            }`}>
                <div className="flex items-center justify-between pb-5 border-b border-beige-dark/30 shrink-0">
                    <span className="text-xs font-bold uppercase tracking-widest text-graphite/50">Menu</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 text-graphite/70 hover:text-sage transition-colors rounded-xl focus:outline-none"
                        aria-label="Zamknij menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col gap-4 py-6 overflow-y-auto">
                    <Link
                        href="/#o-mnie"
                        className="text-graphite font-medium text-base hover:text-sage transition-colors py-1"
                        onClick={() => setIsOpen(false)}
                    >
                        O mnie
                    </Link>
                    <Link
                        href="/#specjalizacja"
                        className="text-graphite font-medium text-base hover:text-sage transition-colors py-1"
                        onClick={() => setIsOpen(false)}
                    >
                        Specjalizacja
                    </Link>
                    <Link
                        href="/blog"
                        className="text-graphite font-medium text-base hover:text-sage transition-colors py-1"
                        onClick={() => setIsOpen(false)}
                    >
                        Blog
                    </Link>
                    <Link
                        href="/#kontakt"
                        className="text-graphite font-medium text-base hover:text-sage transition-colors py-1"
                        onClick={() => setIsOpen(false)}
                    >
                        Kontakt
                    </Link>
                </div>

                <div className="mt-auto pt-6 border-t border-beige-dark/30 pb-4 shrink-0">
                    <Link
                        href="#kalendarz"
                        className="block w-full bg-sage hover:bg-[#8ea38a] text-white px-4 py-3 rounded-xl text-center shadow-md font-semibold text-sm tracking-wide transition-all active:scale-95"
                        onClick={() => setIsOpen(false)}
                    >
                        Umów wizytę
                    </Link>
                </div>
            </aside>
        </>
    );
};
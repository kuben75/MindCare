"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {useSettings} from "@/context/SettingsContext";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const settings = useSettings();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav className={`w-full fixed top-0 left-0 right-0 z-[120] transition-all duration-300 ${
                    scrolled
                        ? "bg-beige-light/90 backdrop-blur-md shadow-sm py-2 border-b border-transparent"
                        : "bg-beige-light border-b border-beige-dark py-4 md:py-6"
                }`}>
                <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center transition-all duration-300">

                    <div className="flex-1 flex justify-start relative z-40">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-105">
                                <Image src="/logo-icon.png" alt="Logo" fill sizes="(max-width: 768px) 40px, 48px" className="object-contain"
                                    priority />
                            </div>

                            <span className="text-lg md:text-xl tracking-widest text-graphite uppercase font-semibold group-hover:text-sage transition-colors">
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
                            className="bg-sage text-white px-6 py-2.5 rounded-md hover:bg-opacity-90 transition-all text-sm tracking-wide font-semibold shadow-sm"
                        >
                            Umów wizytę
                        </Link>
                    </div>

                    <button
                        className="md:hidden text-graphite p-2 focus:outline-none relative z-[180]"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            <div
                className={`md:hidden fixed inset-0 bg-graphite/40 backdrop-blur-sm transition-opacity duration-300 z-[99] ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                onClick={() => setIsOpen(false)}
            />
            <div className={`md:hidden fixed top-0 right-0 h-screen w-[75%] max-w-[320px] bg-beige-light shadow-2xl z-[115] transform transition-transform duration-300 ease-in-out flex flex-col pt-24 px-6 gap-6 border-l border-beige-dark ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}>
                <Link href="/#o-mnie" className="text-graphite font-medium text-lg hover:text-sage transition-colors" onClick={() => setIsOpen(false)}>O mnie</Link>
                <Link href="/#specjalizacja" className="text-graphite font-medium text-lg hover:text-sage transition-colors" onClick={() => setIsOpen(false)}>Specjalizacja</Link>
                <Link href="/blog" className="text-graphite font-medium text-lg hover:text-sage transition-colors" onClick={() => setIsOpen(false)}>Blog</Link>
                <Link href="/#kontakt" className="text-graphite font-medium text-lg hover:text-sage transition-colors" onClick={() => setIsOpen(false)}>Kontakt</Link>

                <div className="mt-4 border-t border-beige-dark pt-6">
                    <Link href="#kalendarz" className="block w-full bg-sage text-white px-4 py-3 rounded-md text-center shadow-sm font-semibold text-lg" onClick={() => setIsOpen(false)}>
                        Umów wizytę
                    </Link>
                </div>
            </div>
        </>
    );
};
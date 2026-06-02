"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

export const Footer = () => {
    const pathname = usePathname();
    const settings = useSettings();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer className="w-full bg-beige-dark pt-16 pb-8 border-t border-beige-dark/50">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="flex flex-col gap-6 lg:pr-6">
                        <div className="relative w-48 h-32 md:w-56 md:h-36 -ml-2">
                            <Image src="/logo-full.png" alt="Logo" fill className="object-contain object-left" />
                        </div>
                        <p className="text-graphite/70 text-sm leading-relaxed -mt-2">
                            "Prawdziwa zmiana zaczyna się od zrozumienia, nie od oceniania."
                        </p>
                        <div className="mt-2 inline-block px-3 py-1 bg-beige-light border border-graphite/10 rounded-full text-xs text-graphite/80 font-medium w-max">
                            Członek APA
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <h3 className="text-graphite font-semibold text-lg mb-1">Kontakt</h3>

                        <a href={`mailto:${settings?.email || "paulinakmirek@gmail.com"}`} className="group flex items-center gap-3 text-graphite/80 hover:text-sage transition-colors">
                            <svg className="w-5 h-5 text-graphite/50 group-hover:text-sage transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="text-sm">{settings?.email || "paulinakmirek@gmail.com"}</span>
                        </a>

                        {settings?.phone && (
                            <a href={`tel:${settings.phone}`} className="group flex items-center gap-3 text-graphite/80 hover:text-sage transition-colors">
                                <svg className="w-5 h-5 text-graphite/50 group-hover:text-sage transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-sm">{settings.phone}</span>
                            </a>
                        )}

                        {settings?.address && (
                            <div className="flex items-center gap-3 text-graphite/80">
                                <svg className="w-5 h-5 text-graphite/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-sm leading-tight">{settings.address}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <h3 className="text-graphite font-semibold text-lg mb-1">Na skróty</h3>
                        <Link href="/#o-mnie" className="text-graphite/80 text-sm hover:text-sage transition-colors w-max">O mnie i moje podejście</Link>
                        <Link href="/#specjalizacja" className="text-graphite/80 text-sm hover:text-sage transition-colors w-max">Obszary wsparcia (Specjalizacja)</Link>
                        <Link href="/blog" className="text-graphite/80 text-sm hover:text-sage transition-colors w-max">Artykuły i poradniki (Blog)</Link>
                        <Link href="/#kalendarz" className="text-graphite/80 text-sm hover:text-sage transition-colors font-medium w-max">Umów wizytę w kalendarzu</Link>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <h3 className="text-graphite font-semibold text-lg mb-1">Bądźmy w kontakcie</h3>
                        <div className="flex gap-4 flex-wrap">

                            {settings?.instagramUrl && (
                                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                                   className="p-2 bg-beige-light rounded-full text-graphite/60 hover:text-sage hover:shadow-md transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                                    </svg>
                                </a>
                            )}

                            {settings?.facebookUrl && (
                                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                                   className="p-2 bg-beige-light rounded-full text-graphite/60 hover:text-sage hover:shadow-md transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                                    </svg>
                                </a>
                            )}

                            {settings?.linkedinUrl && (
                                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                   className="p-2 bg-beige-light rounded-full text-graphite/60 hover:text-sage hover:shadow-md transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                    </svg>
                                </a>
                            )}
                        </div>
                        <div className="mt-4 text-graphite/50 text-xs font-light space-y-1">
                            <p>NIP: 0000000000</p>
                            {settings?.bankAccount && (
                                <p>Nr konta: <span className="font-mono">{settings.bankAccount}</span></p>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className="border-t border-graphite/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-graphite/60 text-center md:text-left">
                    <p>© {new Date().getFullYear()} {settings?.clinicName || "Paulina Kawka-Mirek"}. Wszelkie prawa zastrzeżone.</p>
                    <div className="flex gap-6 font-medium">
                        <Link href="/statute" className="hover:text-sage transition-colors">Polityka prywatności</Link>
                        <Link href="/privacy-policy" className="hover:text-sage transition-colors">Regulamin i RODO</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
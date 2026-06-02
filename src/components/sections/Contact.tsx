"use client";

import React from "react";
import { useSettings } from "@/context/SettingsContext";

export const Contact = () => {
    const settings = useSettings();

    const CONTACT_METHODS = [
        {
            id: "email",
            title: "E-mail",
            value: settings?.email || "paulinakmirek@gmail.com",
            description: "Najlepszy sposób na dłuższe pytania. Odpowiadam w ciągu 24 godzin.",
            href: `mailto:${settings?.email || "paulinakmirek@gmail.com"}`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            )
        },
        {
            id: "phone",
            title: "Telefon / WhatsApp",
            value: settings?.phone || "+44 7599 362770",
            description: "Krótkie pytania organizacyjne lub pilne sprawy.",
            href: settings?.phone ? `tel:${settings.phone.replace(/\s+/g, '')}` : "tel:+447599362770",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            )
        },
        {
            id: "location",
            title: "Gdzie pracuję?",
            value: settings?.address || "Konsultacje Online",
            description: settings?.address ? "Prowadzę terapię online oraz przyjmuję w gabinecie stacjonarnym." : "Prowadzę terapię dla pacjentów z Polski, UK i całego świata.",
            href: "",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )
        }
    ];

    return (
        <section id="kontakt" className="relative w-full py-20 md:py-32 bg-white overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-beige-dark/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
                <div className="text-center md:text-left mb-16 md:mb-20">
                    <span className="text-sage font-semibold tracking-widest uppercase text-sm">Kontakt</span>
                    <h2 className="text-3xl md:text-4xl text-graphite font-serif mt-3">
                        Masz pytania przed wizytą?
                    </h2>
                    <p className="mt-4 text-graphite/70 max-w-2xl font-light mx-auto md:mx-0">
                        Zanim umówisz się na pierwsze spotkanie, możesz chcieć o coś zapytać.
                        Wybierz najwygodniejszą dla siebie formę kontaktu.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {CONTACT_METHODS.map((method) => {
                        const CardWrapper = method.href ? "a" : "div";

                        return (
                            <CardWrapper
                                key={method.id}
                                href={method.href || undefined}
                                className={`
                                    flex flex-col p-8 rounded-2xl border transition-all duration-300
                                    bg-beige-light/30 border-beige-dark/20
                                    ${method.href ? "hover:border-sage hover:shadow-md hover:-translate-y-1 group cursor-pointer" : ""}
                                `}
                            >
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors
                                    bg-white text-sage ${method.href ? "group-hover:bg-sage group-hover:text-white shadow-sm" : "shadow-sm"} 
                                `}>
                                    {method.icon}
                                </div>

                                <h3 className="text-graphite/60 text-sm font-semibold uppercase tracking-wider mb-2">
                                    {method.title}
                                </h3>
                                <p className="text-xl text-graphite font-medium mb-3">
                                    {method.value}
                                </p>
                                <p className="text-graphite/70 text-sm font-light leading-relaxed">
                                    {method.description}
                                </p>
                            </CardWrapper>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
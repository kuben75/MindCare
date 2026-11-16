import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import {Navbar} from "@/components/layout/Navbar";
import {Footer} from "@/components/layout/Footer";
import prisma from "@/infrastructure/prisma";
import {SettingsProvider} from "@/context/SettingsContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://www.psychologiaodbicia.com"),
    title: {
        default: "Paulina Kawka-Mirek | Psycholog Online – Konsultacje po polsku",
        template: "%s | Paulina Kawka-Mirek",
    },
    description: "Indywidualne wsparcie psychologiczne i konsultacje online dla Polaków w kraju i za granicą (UK, Europa). Prawdziwa zmiana zaczyna się od zrozumienia.",
    keywords: [
        "psycholog online",
        "polski psycholog online",
        "polski psycholog UK",
        "konsultacje psychologiczne online",
        "wsparcie psychologiczne online",
        "terapia online po polsku",
        "Paulina Kawka-Mirek",
        "Psychologia Odbicia"
    ],
    authors: [{ name: "Paulina Kawka-Mirek" }],
    creator: "Paulina Kawka-Mirek",
    openGraph: {
        type: "website",
        locale: "pl_PL",
        url: "https://www.psychologiaodbicia.com",
        title: "Paulina Kawka-Mirek | Psycholog Online",
        description: "Indywidualne konsultacje psychologiczne online w języku polskim. Bezpieczna przestrzeń do rozmowy, niezależnie od tego, gdzie mieszkasz.",
        siteName: "Psychologia Odbicia",
        images: [
            {
                url: "/photo-horizontal.jpg",
                width: 1200,
                height: 630,
                alt: "Paulina Kawka-Mirek - Psycholog Online",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Paulina Kawka-Mirek | Psycholog Online",
        description: "Indywidualne konsultacje psychologiczne online w języku polskim.",
        images: ["/photo-horizontal.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
};

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const settings = await prisma.clinicSettings.findUnique({
        where: { id: "global" },
    })
    return (
        <html lang="pl" suppressHydrationWarning className="scroll-smooth">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "PsychologicalService",
                    "name": "Paulina Kawka-Mirek - Psychologia Odbicia",
                    "description": "Indywidualne konsultacje psychologiczne oraz wsparcie emocjonalne online w języku polskim.",
                    "url": "https://www.psychologiaodbicia.com",
                    "image": "https://www.psychologiaodbicia.com/photo-horizontal.jpg",
                    "availableLanguage": {
                        "@type": "Language",
                        "name": "Polish",
                        "alternateName": "pl"
                    },
                    "areaServed": [
                        {
                            "@type": "Country",
                            "name": "Poland"
                        },
                        {
                            "@type": "Country",
                            "name": "United Kingdom"
                        }
                    ],
                    "availableChannel": {
                        "@type": "ServiceChannel",
                        "serviceLocation": {
                            "@type": "VirtualLocation",
                            "url": "https://www.psychologiaodbicia.com"
                        }
                    },
                    "priceRange": "$$",
                    "sameAs": [
                        "https://www.znanylekarz.pl/paulina-kawka-mirek/psycholog/wronki"
                    ]
                })
            }}
        />
        <SettingsProvider initialSettings={settings}>
        <Navbar />
        {children}
        <Footer />
        </SettingsProvider>
        </body>
        </html>
    );
}
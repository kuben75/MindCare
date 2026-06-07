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
    title: "Paulina Kawka-Mirek | Psycholog",
    description: "Wsparcie psychologiczne. Prawdziwa zmiana zaczyna się od zrozumienia.",
};

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const settings = await prisma.clinicSettings.findUnique({
        where: { id: "global" },
    })
    return (
        <html lang="pl" suppressHydrationWarning className="scroll-smooth">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider initialSettings={settings}>
        <Navbar />
        {children}
        <Footer />
        </SettingsProvider>
        </body>
        </html>
    );
}
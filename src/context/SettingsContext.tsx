"use client";

import React, { createContext, useContext, useState } from "react";
import { ClinicSettings } from "@prisma/client";


const SettingsContext = createContext<ClinicSettings | null>(null);

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children, initialSettings }: { children: React.ReactNode, initialSettings: ClinicSettings | null }) {
    const [settings, setSettings] = useState<ClinicSettings | null>(initialSettings);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
}
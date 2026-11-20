"use client";

import React, { createContext, useContext } from "react";
import { ClinicSettings } from "@prisma/client";


const SettingsContext = createContext<ClinicSettings | null>(null);

export const useSettings = () => useContext(SettingsContext);

// Uses the prop directly (no local state), so router.refresh() after saving settings updates the
// navbar/footer immediately.
export function SettingsProvider({ children, initialSettings }: { children: React.ReactNode, initialSettings: ClinicSettings | null }) {
    return (
        <SettingsContext.Provider value={initialSettings}>
            {children}
        </SettingsContext.Provider>
    );
}

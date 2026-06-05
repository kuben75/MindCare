import { ClinicSettings } from "@prisma/client";

export interface IInfoTooltipProps {
    title: string;
    description: string;
    images?: string[];
}


export interface IInitialSettings {
    initialSettings: ClinicSettings;
}



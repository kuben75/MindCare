import {Reservation, ReservationStatus, Service} from "@prisma/client";
import React from "react";

export interface IReservationFormProps {
    initialDate?: string;
    initialTime?: string;
    services: Service[];
}
export interface IActionMenuProps {
    reservationId: string;
    currentStatus: ReservationStatus;
}

export interface IPatientActionsProps {
    token: string;
    status: string;
    isRescheduleRequested?: boolean;
    reservationDate: string | Date
}

export type TReservationWithService = Reservation & {
    service: Service;
};

export interface IReservationModalProps {
    selectedRes: TReservationWithService;
    setSelectedRes: React.Dispatch<React.SetStateAction<TReservationWithService | null>>;
}

export interface ISchedulePayload {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

export interface IDrawerPanelProps {
    reservation: TReservationWithService;
    activeNoteTab: 'PRIVATE' | 'EMAIL';
    setActiveNoteTab: React.Dispatch<React.SetStateAction<'PRIVATE' | 'EMAIL'>>;
    activeNotesText: string;
    setActiveNotesText: React.Dispatch<React.SetStateAction<string>>;
    handleSaveNotes: (id: string) => Promise<void>;
    isSavingNotes: boolean;
    emailMessage: string;
    setEmailMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendFollowUp: (id: string) => Promise<void>;
    isSendingEmail: boolean;
    emailSuccess: boolean;

}

export interface IReservationCardProps {
    reservation: TReservationWithService;
    isExpanded: boolean;
    onToggleDrawer: () => void;
}
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
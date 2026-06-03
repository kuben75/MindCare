import {Reservation, ReservationStatus, Service} from "@prisma/client";

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
import {Service, Waitlist} from "@prisma/client";

export interface IWaitlistFormData {
    services: Service[];
}

export type TWaitlistWithService = Waitlist & {service: Service};
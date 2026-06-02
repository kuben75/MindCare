import {DeviceSession} from "@prisma/client";

export type TDeviceSession = Omit<DeviceSession, 'createdAt'> & {
    createdAt: string;
};
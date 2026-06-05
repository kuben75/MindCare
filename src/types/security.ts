import {DeviceSession} from "@prisma/client";

export type TDeviceSession = Omit<DeviceSession, 'createdAt'> & {
    createdAt: string;
};
export interface IActiveSessionsListProps {
    activeSessions: TDeviceSession[];
    isSessionsLoading: boolean;
    currentSessionId: string | null;
    handleRevokeSession: (id: string) => void;
}


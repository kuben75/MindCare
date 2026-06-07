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

export interface ISecurityTutorialModalProps {
    activeTutorial: string | null;
    tutorialStep: number;
    closeTutorial: () => void;
    mobileOS: 'ios' | 'android';
    setMobileOS: (os: 'ios' | 'android') => void;
    qrCodeData: string | null;
    errorMessage: string | null;
    verificationCode: string;
    setVerificationCode: (code: string) => void;
    recoveryCodes: string[];
    isCopied: boolean;
    handleCopyCodes: () => void;
    handlePrev: () => void;
    handleNext: () => void;
    handleVerifyAndEnable: () => void;
    isLoading: boolean;
}


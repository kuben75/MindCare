export interface ISendMagicLinkParams {
    email: string;
    patientName: string;
    serviceName: string;
    date: Date;
    magicToken: string;
    status?: string;
    bankAccount?: string | null;
    price?: number;
}

export interface IMagicLinkEmailProps extends Omit<ISendMagicLinkParams, 'email' | 'date' | 'magicToken'> {
    date: string;
    time: string;
    magicLink: string;
}

export interface ICancelAppointmentEmailProps {
    patientName: string;
    date: string;
    time: string;
    serviceName: string;
    reason?: string;
    price?: number;
}

export interface INewDeviceAlertEmailProps {
    adminName?: string;
    deviceInfo: string;
    ipAddress: string;
    time: string;
}

export interface IUniversalEmailProps {
    title: string;
    previewText: string;
    greeting?: string;
    message: string;
    actionLabel?: string;
    actionUrl?: string;
}
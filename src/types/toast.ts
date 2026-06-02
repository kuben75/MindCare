export type ToastType = "success" | "error" | "info";

export interface IToastState {
    message: string;
    type: ToastType;
}

export interface IToastProps {
    toast: IToastState | null;
    onClose: () => void;
}
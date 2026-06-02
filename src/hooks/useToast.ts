import { useState, useCallback } from "react";
import {IToastState, ToastType} from "@/types/toast";

export const useToast = () => {
    const [toast, setToast] = useState<IToastState | null>(null);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return { toast, showToast, hideToast };
};
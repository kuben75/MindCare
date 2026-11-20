import { useState, useCallback, useEffect, useRef } from "react";
import {IToastState, ToastType} from "@/types/toast";

export const useToast = () => {
    const [toast, setToast] = useState<IToastState | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        // A new toast restarts the timer, so it isn't hidden early by the previous one's timeout.
        if (timer.current) clearTimeout(timer.current);
        setToast({ message, type });
        timer.current = setTimeout(() => {
            setToast(null);
            timer.current = null;
        }, type === "error" ? 6000 : 4000);
    }, []);

    const hideToast = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        setToast(null);
    }, []);

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    return { toast, showToast, hideToast };
};

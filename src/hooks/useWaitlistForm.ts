import React, {useEffect, useState} from "react";
import {IWaitlistFormData} from "@/types/waitlist";

export const useWaitlistForm = ({services}: IWaitlistFormData) => {

    const [formData, setFormData] = useState( {
        patientName: "",
        email: "",
        phone: "",
        serviceId: services[0]?.id || "",
        notes: ""
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");
    const [turnstileToken, setTurnstileToken] = useState("");
    const [turnstileKey, setTurnstileKey] = useState(0);

    useEffect(() => {
        if(services.length > 0 && !formData.serviceId) {
            setFormData(prev => ({...prev, serviceId: services[0].id}));
        }
    }, [services, formData.serviceId]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage("");

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({...formData, turnstileToken}),
            });
            const data = await res.json();
            // Turnstile tokens are single-use — remount the widget for the next submission.
            setTurnstileToken("");
            setTurnstileKey(k => k + 1);
            if(res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(data.error || "Nie udało się zapisać na listę oczekujących. Spróbuj ponownie później.");
            }
        }catch {
            setStatus('error');
            setErrorMessage("Wystąpił błąd podczas zapisywania. Sprawdź połączenie z internetem i spróbuj ponownie.");
        }
    }
    return {
        formData,
        setFormData,
        status,
        errorMessage,
        handleSubmit,
        setStatus,
        turnstileToken,
        setTurnstileToken,
        turnstileKey
    }
}
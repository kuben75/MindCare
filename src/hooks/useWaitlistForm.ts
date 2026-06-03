import React, {useState} from "react";
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

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage("");

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if(res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(data.error || "Nie udało się zapisać na listę oczekujących. Spróbuj ponownie później.");
            }
        }catch (e) {
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
        setStatus
    }
}
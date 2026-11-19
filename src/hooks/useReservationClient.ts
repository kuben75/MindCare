import React, {useState} from "react";
import {IReservationFormProps} from "@/types/reservation";
import {buildWarsawDateObj} from "@/utils/warsaw-time";


export const useReservationClient = ({ initialDate, initialTime, services }: IReservationFormProps) => {
    const defaultServiceId = Array.isArray(services) && services.length > 0 ? services[0].id : "";
    const [serviceId, setServiceId] = useState<string>(defaultServiceId);
    const [patientName, setPatientName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [turnstileKey, setTurnstileKey] = useState(0);

    const formattedDate = initialDate
        ? new Date(initialDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : "Nie wybrano daty";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialDate || !initialTime || !serviceId) {
            setErrorMessage("Błąd połączenia z serwerem. Spróbuj ponownie.");
            return;
        }
        setIsLoading(true);
        try{
            const finalDateObj = buildWarsawDateObj(initialDate, initialTime);

            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ patientName, email, phone, serviceId, date: finalDateObj.toISOString(), termsAccepted, turnstileToken})
            })
            if(response.ok) {
                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    setErrorMessage("Nie udało się dokończyć rezerwacji. Spróbuj ponownie.");
                }
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.error || "Wystąpił błąd podczas rezerwacji.");
                // Turnstile tokens are single-use — remount the widget for a fresh challenge.
                setTurnstileToken("");
                setTurnstileKey(k => k + 1);
            }
        }catch {
            setErrorMessage("Błąd połączenia z serwerem. Spróbuj ponownie.");
        }finally{
            setIsLoading(false);
        }
    };
    return {
        serviceId,
        setServiceId,
        patientName,
        setPatientName,
        email,
        setEmail,
        phone,
        setPhone,
        termsAccepted,
        setTermsAccepted,
        isLoading,
        errorMessage,
        formattedDate,
        handleSubmit,
        turnstileToken,
        setTurnstileToken,
        turnstileKey
    }
}
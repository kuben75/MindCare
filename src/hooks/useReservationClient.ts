import React, {useState} from "react";
import {IReservationFormProps} from "@/types/reservation";
import {DateTime} from "luxon";
import {PATIENT_TZ, dateKeyIn, zonedInstant} from "@/lib/time";

/** Accepts "yyyy-MM-dd" (current links) or a full ISO instant (older links). */
const toPatientDateKey = (value?: string): string | null => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : dateKeyIn(parsed, PATIENT_TZ);
};


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

    // Dates on this page are always Polish time (PATIENT_TZ), independent of the browser zone.
    const dateKey = toPatientDateKey(initialDate);
    const formattedDate = dateKey
        ? DateTime.fromISO(dateKey).setLocale("pl").toFormat("cccc, d MMMM yyyy")
        : "Nie wybrano daty";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        const finalDateObj = zonedInstant(dateKey, initialTime, PATIENT_TZ);
        if (!finalDateObj || !serviceId) {
            setErrorMessage("Nie wybrano poprawnego terminu. Wróć do kalendarza i wybierz termin ponownie.");
            return;
        }
        setIsLoading(true);
        let redirecting = false;
        try{

            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ patientName, email, phone, serviceId, date: finalDateObj.toISOString(), termsAccepted, turnstileToken})
            })
            if(response.ok) {
                const data = await response.json();
                if (data.url) {
                    redirecting = true;
                    window.location.href = data.url;
                } else {
                    setErrorMessage("Nie udało się dokończyć rezerwacji. Spróbuj ponownie.");
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setErrorMessage(errorData.error || "Wystąpił błąd podczas rezerwacji.");
                // Turnstile tokens are single-use — remount the widget for a fresh challenge.
                setTurnstileToken("");
                setTurnstileKey(k => k + 1);
            }
        }catch {
            setErrorMessage("Błąd połączenia z serwerem. Spróbuj ponownie.");
        }finally{
            // Keep the button disabled while the browser navigates away (no double booking).
            if (!redirecting) setIsLoading(false);
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
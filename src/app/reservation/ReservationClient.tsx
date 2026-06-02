"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {IReservationFormProps} from "@/types/reservation";

export default function ReservationClient({ initialDate, initialTime, services }: IReservationFormProps) {
    const router = useRouter();
    const defaultServiceId = Array.isArray(services) && services.length > 0 ? services[0].id : "";
    const [serviceId, setServiceId] = useState<string>(defaultServiceId);
    const [patientName, setPatientName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
           const finalDateObj = new Date(initialDate);
           const [hours, minutes] = initialTime.split(":");
           finalDateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
           const response = await fetch('/api/reservations', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ patientName, email, phone, serviceId, date: finalDateObj.toISOString(), termsAccepted})
           })
           if(response.ok) {
               const data = await response.json();
               if (data.url) {
                   window.location.href = data.url;
               } else {
                   setErrorMessage("Błąd systemu płatności.");
               }
           } else {
               const errorData = await response.json();
               setErrorMessage(errorData.error || "Wystąpił błąd podczas rezerwacji.");
           }
       }catch (e) {
           setErrorMessage("Błąd połączenia z serwerem. Spróbuj ponownie.");
       }finally{
              setIsLoading(false);
       }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-beige-dark/20 shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-sage/10 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-graphite/50 uppercase tracking-wider font-semibold mb-1">Twój termin</p>
                        <p className="text-graphite font-medium capitalize">{formattedDate}</p>
                    </div>
                </div>
                <div className="text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-beige-dark/10 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-xs text-graphite/50 uppercase tracking-wider font-semibold mb-1">Godzina</p>
                    <p className="text-2xl font-bold text-sage">{initialTime || "--:--"}</p>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-beige-dark/20 shadow-sm space-y-6">
                <h2 className="text-xl font-serif text-graphite">Wybierz usługę</h2>

                {services.length === 0 ? (
                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm border border-yellow-200">
                        Brak skonfigurowanych usług w bazie danych. Dodaj je w panelu administratora.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <label
                                key={service.id}
                                className={`
                                    relative cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4
                                    ${serviceId === service.id
                                    ? "border-sage bg-sage/5 shadow-md ring-2 ring-sage/20 ring-offset-1"
                                    : "border-beige-dark/20 bg-white hover:border-sage/40 hover:bg-beige-light/30"}
                                `}
                            >
                                <input
                                    type="radio"
                                    name="service"
                                    value={service.id}
                                    checked={serviceId === service.id}
                                    onChange={(e) => setServiceId(e.target.value)}
                                    className="sr-only"
                                />

                                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${serviceId === service.id ? "border-sage bg-sage" : "border-beige-dark/40"}`}>
                                    {serviceId === service.id && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <span className="font-semibold text-graphite leading-tight">{service.name}</span>
                                        <span className="font-bold text-sage whitespace-nowrap">{service.price} zł</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-graphite/60">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Czas trwania: {service.duration} min
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-beige-dark/20 shadow-sm space-y-6">
                <h2 className="text-xl font-serif text-graphite">Twoje dane</h2>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-graphite/80 mb-2">Imię i nazwisko</label>
                        <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full px-5 py-3.5 bg-beige-light/30 border border-beige-dark/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all text-graphite placeholder:text-graphite/30"/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-graphite/80 mb-2">Adres E-mail</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3.5 bg-beige-light/30 border border-beige-dark/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all text-graphite placeholder:text-graphite/30"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-graphite/80 mb-2">Numer telefonu</label>
                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-5 py-3.5 bg-beige-light/30 border border-beige-dark/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-all text-graphite placeholder:text-graphite/30"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 mb-6">
                    <label
                        className="flex items-start gap-3 p-3.5 bg-beige-light/20 border border-beige-dark/30  rounded-xl hover:bg-beige-light/40  transition-colors group">
                        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="peer appearance-none w-5 h-5 border-2 border-beige-dark/80  rounded bg-white  checked:bg-sage checked:border-sage  focus:outline-none focus:ring-2 focus:ring-sage/30 transition-all cursor-pointer"/>
                            <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <div className="text-[11px] sm:text-xs text-graphite/70  leading-relaxed select-none">
                            Akceptuję <a href="/statute" target="_blank" onClick={(e) => e.stopPropagation()}
                                         className="text-beige/dark/60  font-semibold hover:underline">Regulamin
                            gabinetu</a> oraz <a href="/privacy-policy" target="_blank"
                                                 onClick={(e) => e.stopPropagation()}
                                                 className="text-beige/dark/60 font-semibold hover:underline">Politykę
                            Prywatności (RODO)</a>. Rozumiem i akceptuję, że bezpłatne odwołanie wizyty możliwe jest
                            najpóźniej na <strong>24 godziny przed jej terminem</strong>.
                        </div>
                    </label>
                </div>
            </div>
            {errorMessage && (
                <div
                    className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm flex items-center gap-3 animate-fade-in shadow-sm">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {errorMessage}
                </div>
            )}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || !initialDate || !initialTime || !serviceId || !termsAccepted}
                    className="w-full md:w-auto px-12 py-4 bg-sage text-white font-semibold text-lg rounded-xl shadow-xl shadow-sage/20 hover:bg-opacity-90 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <span
                            className={`animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full`}></span>
                    ) : (
                        <>
                            Potwierdź rezerwację
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
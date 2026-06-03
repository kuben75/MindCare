"use client";

import {IWaitlistFormData} from "@/types/waitlist";
import React from "react";
import {useWaitlistForm} from "@/hooks/useWaitlistForm";

export default function WaitlistForm({services}: IWaitlistFormData) {
    const {
        formData,
        setFormData,
        status,
        errorMessage,
        handleSubmit,
        setStatus
    } = useWaitlistForm({services});
    if (status === 'success') {
        return (
            <div className="bg-sage/10  border border-sage/30  rounded-2xl p-8 text-center animate-fade-in h-full flex flex-col justify-center items-center min-h-[400px]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="text-xl font-serif text-graphite mb-2">Jesteś na liście!</h3>
                <p className="text-graphite/70  max-w-sm">
                    Dziękuję za zgłoszenie. Jeśli tylko zwolni się termin na wybraną usługę, skontaktuję się z Tobą najszybciej jak to możliwe.
                </p>
                <button onClick={() => {setStatus('idle');setFormData({ ...formData, notes: "" });}}
                    className="mt-6 px-6 py-2 bg-white  border border-beige-dark/80  rounded-xl text-sm font-medium text-graphite  hover:bg-beige-light/40 transition-colors">
                    Zapisz się na inną usługę
                </button>
            </div>
        );
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-1 animate-fade-in">
            {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {errorMessage}
                </div>
            )}
            <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-graphite/60 mb-1.5">Imię i Nazwisko</label>

                <input type="text" required value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                       className="w-full px-4 py-3 rounded-xl border border-beige-dark/80 bg-beige-light/10 text-sm focus:ring-2 focus:ring-sage focus:outline-none transition-all"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label
                        className="block text-sm font-semibold uppercase tracking-wider text-graphite/60 mb-1.5">E-mail</label>
                    <input type="email" required value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full px-4 py-3 rounded-xl border border-beige-dark/80 bg-beige-light/10 text-sm focus:ring-2 focus:ring-sage focus:outline-none transition-all"/>
                </div>
                <div>
                    <label
                        className="block text-sm font-semibold uppercase tracking-wider text-graphite/60 mb-1.5">Telefon</label>
                    <input type="tel" required value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           className="w-full px-4 py-3 rounded-xl border border-beige-dark/80 bg-beige-light/10 text-sm focus:ring-2 focus:ring-sage focus:outline-none transition-all"/>
                </div>
            </div>
                <div>
                    <label
                        className="block text-sm font-semibold uppercase tracking-wider text-graphite/60 mb-1.5">Usługa</label>
                    <select value={formData.serviceId}
                            onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-beige-dark/80 bg-white  text-sm focus:ring-2 focus:ring-sage focus:outline-none transition-all hover:cursor-pointer">
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label
                        className="block text-sm font-semibold uppercase tracking-wider text-graphite/60 mb-1.5">Dodatkowe informacje (opcjonalnie)</label>
                    <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-beige-dark/80 bg-beige-light/10 text-sm focus:ring-2 focus:ring-sage focus:outline-none transition-all resize-y"
                    />
                </div>
            <button type="submit" disabled={status === 'loading'}
                className={`w-full py-3.5 bg-sage text-white rounded-xl text-sm font-bold tracking-wide hover:bg-opacity-90 transition-all shadow-md mt-2 disabled:opacity-50 hover:cursor-pointer ${status === 'loading' ? 'cursor-not-allowed' : ''}`}>
                {status === 'loading' ? 'Zapisywanie...' : 'Zapisz mnie na listę'}
            </button>
            <p className="text-center text-[11px] text-graphite/40 mt-3">
                Zapis na listę rezerwową nie jest gwarancją wizyty. Skontaktujemy się z Tobą, gdy zwolni się termin.
            </p>

        </form>
    )
}

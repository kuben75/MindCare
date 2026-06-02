"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, Suspense } from "react";

function FailedContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [isLoadingRetry, setIsLoadingRetry] = useState(false);
    const [isLoadingAbandon, setIsLoadingAbandon] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRetryPayment = async () => {
        if (!token) return;
        setIsLoadingRetry(true);
        setError(null);

        try {
            const res = await fetch('/api/patient/reservation/retry-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            if (res.ok) {
                const data = await res.json();
                window.location.href = data.url;
            } else {
                const data = await res.json();
                setError(data.message || "Twój termin prawdopodobnie wygasł. Wybierz go ponownie na stronie głównej.");
            }
        } catch (e) {
            setError("Błąd połączenia z serwerem.");
        } finally {
            setIsLoadingRetry(false);
        }
    };

    const handleAbandon = async () => {
        if (!token) return;
        setIsLoadingAbandon(true);

        try {
            await fetch('/api/patient/reservation/abandon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            router.push('/');
        } catch (e) {
            router.push('/');
        }
    };

    if (!token) {
        return (
            <div className="text-center py-20">
                <p className="text-graphite/60">Nieprawidłowy link.</p>
                <button onClick={() => router.push('/')} className="mt-4 text-sage font-semibold hover:underline">Wróć na stronę główną</button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-8 relative z-10 animate-fade-in">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-amber-200 shadow-xl shadow-amber-900/5 text-center">

                <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-3xl text-graphite font-serif mb-4">
                    Płatność nie powiodła się
                </h1>

                <p className="text-graphite/70 mb-8 leading-relaxed">
                    Twoja transakcja nie została sfinalizowana, a opłata nie została pobrana z konta.
                    Nie martw się, <strong className="text-graphite">Twój termin został tymczasowo zachowany</strong>.
                    Możesz spróbować opłacić wizytę jeszcze raz.
                </p>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleRetryPayment}
                        disabled={isLoadingRetry || isLoadingAbandon}
                        className="w-full py-4 bg-sage text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer"
                    >
                        {isLoadingRetry ? (
                            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Spróbuj opłacić ponownie
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleAbandon}
                        disabled={isLoadingRetry || isLoadingAbandon}
                        className="w-full py-3.5 bg-transparent border border-beige-dark/30 text-graphite/70 font-semibold text-sm rounded-xl hover:bg-beige-light/50 transition-all disabled:opacity-50 hover:cursor-pointer"
                    >
                        {isLoadingAbandon ? "Zwalnianie terminu..." : "Zrezygnuj i wróć na stronę główną"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ReservationFailedPage() {
    return (
        <main className="min-h-screen bg-[#faf9f7] pt-32 pb-24 relative overflow-hidden flex items-center justify-center">
            <Suspense fallback={<div className="text-sage animate-pulse">Ładowanie...</div>}>
                <FailedContent />
            </Suspense>
        </main>
    );
}
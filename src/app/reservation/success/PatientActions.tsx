"use client";
import {IPatientActionsProps} from "@/types/reservation";
import {useState} from "react";
import {useRouter} from "next/navigation";


export default function PatientActions({token, status, isRescheduleRequested}: IPatientActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isReservationCancelled, setIsReservationCancelled] = useState(false);
    const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);

    if (status === 'CANCELLED' || status === 'COMPLETED') {
        return null;
    }


    const handleCancel = async () => {
        setIsLoading(true);

        try {
            const res = await fetch("/api/patient/reservation/cancel", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token})
            });

            if (res.ok) {
                setMessage("Rezerwacja została anulowana");
                router.refresh();
            }
            else {
                const data = await res.json();
                setMessage(data.message || "Nie można anulować rezerwacji");
            }
        } catch (e) {
            setMessage("Coś poszło nie tak. Spróbuj ponownie później.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleReschedule = async () => {
        setIsLoading(true);
        try {
           const res = await fetch("/api/patient/reservation/reschedule", {
               method: "POST",
               headers: {"Content-Type": "application/json"},
               body: JSON.stringify({token})
           })

            if(res.ok) {
                setShowRescheduleConfirm(false);
                router.refresh();
            }
            else {
                const data = await res.json();
                setMessage(data.message || "Nie można złożyć prośby o zmianę terminu");
            }
        }catch (e) {
            setMessage("Coś poszło nie tak. Spróbuj ponownie później.");
        }finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="pt-2 pb-6 min-h-[150px] flex flex-col items-center justify-center">

            {message && !isReservationCancelled && !showRescheduleConfirm && (
                <div className="mb-4 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in border border-amber-200">
                    {message}
                </div>
            )}

            {!isReservationCancelled && !showRescheduleConfirm && (
                <div className="flex flex-col sm:flex-row justify-center gap-3 w-full animate-fade-in">
                    <button
                        onClick={() => {
                            if (!isRescheduleRequested) {
                                setShowRescheduleConfirm(true);
                            }
                        }}
                        disabled={isLoading || isRescheduleRequested}
                        className={`px-6 py-3 border-2 transition-colors rounded-xl text-sm font-semibold shadow-sm w-full sm:w-auto disabled:opacity-70 flex items-center justify-center gap-2 ${
                            isRescheduleRequested
                                ? 'bg-beige-light/30 border-sage text-sage cursor-default'
                                : 'bg-white border-beige-dark/30 text-graphite hover:border-sage hover:cursor-pointer'}`}>
                        {isRescheduleRequested ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                Prośba o zmianę wysłana
                            </>
                        ) : (
                            "Poproś o zmianę terminu"
                        )}
                    </button>
                    <button
                        onClick={() => setIsReservationCancelled(true)}
                        disabled={isLoading || isRescheduleRequested}
                        className="px-6 py-3 bg-white border-2 border-red-100 text-red-600 hover:bg-red-200 hover:cursor-pointer transition-colors rounded-xl text-sm font-semibold shadow-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Odwołaj wizytę
                    </button>
                </div>
            )}

            {showRescheduleConfirm && (
                <div className="w-full bg-sage/5 p-6 rounded-2xl border border-sage/20 text-center space-y-4 animate-fade-in shadow-sm">
                    <p className="text-sm text-graphite font-medium leading-relaxed">
                        Czy na pewno chcesz poprosić o zmianę terminu?<br/>
                        <span className="text-xs text-graphite/60 font-normal">Twój obecny termin pozostanie zarezerwowany, dopóki wspólnie nie ustalimy nowej daty.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
                        <button onClick={() => setShowRescheduleConfirm(false)} className="px-8 py-2.5 bg-white border border-beige-dark/30 text-graphite hover:bg-beige-light/50 transition-colors rounded-xl text-sm font-semibold shadow-sm w-full sm:w-auto hover:cursor-pointer">
                            Wróć
                        </button>
                        <button onClick={handleReschedule} disabled={isLoading} className="px-8 py-2.5 text-white bg-sage hover:bg-opacity-90 transition-colors rounded-xl text-sm font-semibold shadow-xl shadow-sage/20 w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer">
                            {isLoading ? (
                                <>
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Wysyłanie...
                                </>
                            ) : (
                                "Tak, wyślij prośbę"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {isReservationCancelled && (
                <div className="w-full bg-red-50/50 p-6 rounded-2xl border border-red-100 text-center space-y-4 animate-fade-in shadow-sm">
                    <p className="text-sm text-red-800 font-medium leading-relaxed">
                        Czy na pewno chcesz odwołać wizytę?
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
                        <button onClick={() => setIsReservationCancelled(false)} className="px-8 py-2.5 bg-white border border-beige-dark/30 text-graphite hover:border-sage transition-colors rounded-xl text-sm font-semibold shadow-sm w-full sm:w-auto hover:cursor-pointer">
                            Nie, zachowaj wizytę
                        </button>
                        <button onClick={handleCancel} disabled={isLoading} className="px-8 py-2.5 text-white bg-red-600 hover:bg-red-700 transition-colors rounded-xl text-sm font-semibold shadow-xl shadow-red-500/20 w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer">
                            {isLoading ? (
                                <>
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
                                    Odwoływanie...
                                </>
                            ) : (
                                "Odwołaj wizytę"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {isRescheduleRequested && !isReservationCancelled && !showRescheduleConfirm && (
                <p className="mt-4 text-xs text-graphite/50 text-center max-w-sm animate-fade-in">
                    Otrzymaliśmy Twoją prośbę. Skontaktujemy się z Tobą w celu ustalenia nowego terminu.
                </p>
            )}
        </div>
    );
}
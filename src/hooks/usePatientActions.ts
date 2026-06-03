import {useRouter} from "next/navigation";
import {useState} from "react";
import {IPatientActionsProps} from "@/types/reservation";

export const usePatientActions = ({ token, status, isRescheduleRequested, reservationDate }: IPatientActionsProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isReservationCancelled, setIsReservationCancelled] = useState(false);
    const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);


    const now = new Date();
    const resDate = new Date(reservationDate);
    const timeDiff = resDate.getTime() - now.getTime();
    const isLessThan24h = timeDiff / (1000 * 60 * 60) < 24;

    const handleCancel = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/patient/reservation/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });

            if (res.ok) {
                setMessage("Rezerwacja została anulowana");
                router.refresh();
            } else {
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });

            if (res.ok) {
                setShowRescheduleConfirm(false);
                router.refresh();
            } else {
                const data = await res.json();
                setMessage(data.message || "Nie można złożyć prośby o zmianę terminu");
            }
        } catch (e) {
            setMessage("Coś poszło nie tak. Spróbuj ponownie później.");
        } finally {
            setIsLoading(false);
        }
    };
    return {
        isLoading,
        message,
        isReservationCancelled,
        showRescheduleConfirm,
        setShowRescheduleConfirm,
        setIsReservationCancelled,
        handleCancel,
        handleReschedule,
        isLessThan24h
    }
}
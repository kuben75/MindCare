import React, { useEffect, useState, useCallback } from "react";
import { BlockedTime } from "@prisma/client";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { useRouter } from "next/navigation";

export const useBlockedTimeManager = () => {
    const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("16:00");
    const [reason, setReason] = useState("");

    const { showToast, hideToast, toast } = useToast();
    const confirm = useConfirm();
    const router = useRouter();

    const fetchBlockedTimes = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/blocked-time");
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setBlockedTimes(data);
            } else {
                setBlockedTimes([]);
            }
        } catch  {
            setBlockedTimes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlockedTimes();
    }, [fetchBlockedTimes]);

    const handleAddBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/blocked-time", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, startTime, endTime, reason })
            });
            if (res.ok) {
                setDate("");
                setReason("");
                showToast("Termin został skutecznie zablokowany.", "success");
                await fetchBlockedTimes();
                router.refresh();
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || "Nie można zablokować tego terminu.", "error");
            }
        } catch  {
            showToast("Błąd serwera przy dodawaniu wyjątku.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const hasConfirmed = await confirm("Czy na pewno chcesz odblokować ten termin? Będzie on ponownie dostępny dla pacjentów.", {
            title: "Usuwanie wyjątku",
            confirmLabel: "Tak, odblokuj",
            type: "danger"
        });

        if (!hasConfirmed) return;

        try {
            const res = await fetch(`/api/admin/blocked-time/${id}`, { method: "DELETE" });

            if (res.ok) {
                setBlockedTimes(prev => prev.filter(b => b.id !== id));
                showToast("Termin został pomyślnie odblokowany.", "success");
                router.refresh();
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || "Wystąpił błąd podczas usuwania.", "error");
            }
        } catch  {
            showToast("Błąd połączenia z serwerem.", "error");
        }
    };

    return {
        blockedTimes, isLoading, isSubmitting, date, setDate, startTime, setStartTime,
        endTime, setEndTime, reason, setReason, handleAddBlock, handleDelete, hideToast, toast
    };
};
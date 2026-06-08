import { useState } from "react";
import { WeeklySchedule } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export const useScheduleForm = ({ initialSchedules }: { initialSchedules: WeeklySchedule[] }) => {
    const [schedules, setSchedules] = useState<WeeklySchedule[]>(initialSchedules);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showToast, toast, hideToast } = useToast();

    const handleToggleDay = (dayOfWeek: number) => {
        setSchedules(prev => prev.map(s =>
            s.dayOfWeek === dayOfWeek ? { ...s, isActive: !s.isActive } : s))
    };

    const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
        setSchedules(prev => prev.map(s =>
            s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/schedule", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schedules })
            });

            if (response.ok) {
                showToast("Godziny pracy zostały zapisane.", "success");
                router.refresh();
            } else {
                showToast("Nie udało się zaktualizować grafiku.", "error");
            }
        } catch {
            showToast("Błąd serwera. Spróbuj ponownie później.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return { schedules, isLoading, handleToggleDay, handleTimeChange, handleSave, toast, hideToast  };
};
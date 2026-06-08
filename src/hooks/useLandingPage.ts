import { useEffect, useState, useCallback } from "react";
import { THeroTemplate } from "@/types/hero";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

export const useLandingPage = () => {
    const [templates, setTemplates] = useState<THeroTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const router = useRouter();

    const confirm = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/hero");
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch {
            showToast("Nie udało się pobrać szablonów z serwera.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleActivate = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/hero/${id}/activate`, {
                method: "PATCH",
            });
            if (res.ok) {
                await fetchTemplates();
                showToast("Szablon został opublikowany na stronie głównej.", "success");
                router.refresh();
            } else {
                showToast("Wystąpił błąd podczas aktywacji szablonu.", "error");
            }
        } catch {
            showToast("Wystąpił błąd połączenia z serwerem.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string, isActive: boolean) => {
        if (isActive) {
            showToast("Nie można usunąć aktywnego szablonu. Najpierw aktywuj inny.", "error");
            return;
        }

        const hasConfirmed = await confirm("Czy na pewno chcesz bezpowrotnie usunąć ten szablon sekcji głównej?", {
            title: "Usuwanie szablonu",
            confirmLabel: "Tak, usuń trwale",
            type: "danger"
        });

        if (!hasConfirmed) return;

        try {
            const res = await fetch(`/api/admin/hero/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setTemplates((prev) => prev.filter((t) => t.id !== id));
                showToast("Szablon został usunięty.", "success");
                router.refresh();
            } else {
                const data = await res.json();
                showToast(data.message || "Wystąpił błąd podczas usuwania szablonu.", "error");
            }
        } catch {
            showToast("Wystąpił błąd połączenia z serwerem.", "error");
        }
    };

    return {
        templates,
        isLoading,
        actionLoading,
        handleActivate,
        handleDelete,
        toast,
        hideToast
    };
};
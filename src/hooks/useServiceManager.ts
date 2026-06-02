import { useState } from "react";
import { Service } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";

export const useServiceManager = ({ initialServices }: { initialServices: Service[] }) => {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [duration, setDuration] = useState("60");
    const [price, setPrice] = useState("");

    const { toast, showToast, hideToast } = useToast();
    const confirm = useConfirm();

    const refreshData = async () => {
        const res = await fetch("/api/admin/services");
        if (res.ok) {
            const data = await res.json();
            setServices(data);
        }
    };

    const handleEditClick = (service: Service) => {
        setEditingId(service.id);
        setName(service.name);
        setDuration(service.duration.toString());
        setPrice(service.price.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName("");
        setDuration("60");
        setPrice("");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
        const method = editingId ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, duration, price })
            });

            if (res.ok) {
                const actionText = editingId ? "Usługa została zaktualizowana." : "Pomyślnie dodano nową usługę.";
                handleCancelEdit();
                await refreshData();
                router.refresh();
                showToast(actionText, "success");
            } else {
                const data = await res.json();
                showToast(data.error || "Nie można zapisać tej usługi. Sprawdź dane.", "error");
            }
        } catch (e) {
            console.error("Error saving service:", e);
            showToast("Wystąpił błąd podczas zapisywania usługi.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, serviceName: string) => {
        const hasConfirmed = await confirm(
            `Czy na pewno chcesz usunąć usługę "${serviceName}"? Tej operacji nie można cofnąć. Pamiętaj, że pacjenci, którzy ją wykupili, nadal ją zobaczą.`,
            { title: "Usuwanie usługi", confirmLabel: "Tak, usuń trwale", type: "danger" }
        );

        if (!hasConfirmed) return;

        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
            if (res.ok) {
                setServices(prev => prev.filter(s => s.id !== id));
                showToast("Katalog: Usługa została trwale usunięta.", "success");
                router.refresh();
            } else {
                const data = await res.json();
                showToast(data.error || "Nie można usunąć tej usługi. Użyj opcji 'Ukryj usługę'.", "error");
            }
        } catch (e) {
            console.error("Error deleting service:", e);
            showToast("Nie udało się połączyć z serwerem.", "error");
        }
    };

    const handleToggleActive = async (service: Service) => {
        try {
            const res = await fetch(`/api/admin/services/${service.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !service.isActive })
            });

            if (res.ok) {
                await refreshData();
                showToast(service.isActive ? "Usługa została ukryta przed pacjentami." : "Usługa jest teraz widoczna w kalendarzu.", "info");
                router.refresh();
            } else {
                showToast("Nie udało się zmienić widoczności usługi.", "error");
            }
        } catch (e) {
            console.error("Error toggling service active state:", e);
            showToast("Wystąpił błąd podczas zmiany widoczności.", "error");
        }
    };

    return {
        services, isLoading, editingId, name, duration, price,
        handleEditClick, handleCancelEdit, handleSave, handleDelete,
        handleToggleActive, setName, setDuration, setPrice, toast, hideToast
    };
};
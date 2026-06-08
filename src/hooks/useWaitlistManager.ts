import {useState} from "react";
import {useRouter} from "next/navigation";
import {useConfirm} from "@/hooks/useConfirm";
import {useToast} from "@/hooks/useToast";


export const useWaitlistManager = () => {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();
    const confirm = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    const handleDelete = async (id: string, patientName: string) => {
        const hasConfirmed = await confirm(
            `Czy na pewno chcesz usunąć pacjenta ${patientName} z kolejki oczekujących? Zrób to tylko wtedy, gdy pacjent został wpisany do kalendarza lub zrezygnował.`,
            {
                title: "Oznacz jako zrobione",
                confirmLabel: "Tak, usuń",
                type: "danger"
            }
        );

        if (!hasConfirmed) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/admin/waitlist/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast("Pacjent został usunięty z listy rezerwowej.", "success");
                router.refresh();
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || "Nie udało się usunąć pacjenta. Spróbuj ponownie.", "error");
            }
        } catch {
            showToast("Błąd połączenia z serwerem.", "error");
        } finally {
            setIsDeleting(null);
        }
    };
    return {
        isDeleting,
        handleDelete,
        toast,
        hideToast
    }
}
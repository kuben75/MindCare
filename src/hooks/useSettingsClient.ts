import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import {ClinicSettings} from "@prisma/client";

export const useSettingsClient = (initialSettings: ClinicSettings) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const [formData, setFormData] = useState({
        clinicName: initialSettings?.clinicName || "",
        email: initialSettings?.email || "",
        phone: initialSettings?.phone || "",
        address: initialSettings?.address || "",
        bankAccount: initialSettings?.bankAccount || "",
        instagramUrl: initialSettings?.instagramUrl || "",
        facebookUrl: initialSettings?.facebookUrl || "",
        linkedinUrl: initialSettings?.linkedinUrl || "",
        znanyLekarzUrl: initialSettings?.znanyLekarzUrl || "",
        nipNumber: initialSettings?.nipNumber || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showToast("Ustawienia zostały pomyślnie zapisane.", "success");
                router.refresh();
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || "Wystąpił błąd podczas zapisywania.", "error");
            }
        } catch (error) {
            showToast("Brak połączenia z serwerem.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        isLoading,
        handleChange,
        handleSubmit,
        toast,
        hideToast
    };
};
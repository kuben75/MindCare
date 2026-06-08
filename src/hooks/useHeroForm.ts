import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/useToast";
import React, {useState} from "react";
import {THeroLayout, THeroProps, TImageStyle} from "@/types/hero";


export const useHeroForm = ({ initialData }: { initialData?: THeroProps }) => {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [title, setTitle] = useState(initialData?.title || "Prawdziwa zmiana\nzaczyna się od\n*zrozumienia*");
    const [subtitle, setSubtitle] = useState(initialData?.subtitle || "...nie od oceniania, ale od uważnego przyjrzenia się temu, co dzieje się tu i teraz.");
    const [layout, setLayout] = useState<THeroLayout>(initialData?.layout || "TEXT_LEFT");
    const [imageStyle, setImageStyle] = useState<TImageStyle>(initialData?.imageStyle || "HORIZONTAL");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || "/photo-horizontal.jpg");
    const [showPrimaryButton, setShowPrimaryButton] = useState<boolean>(initialData?.showPrimaryButton ?? true);
    const [primaryButtonText, setPrimaryButtonText] = useState(initialData?.primaryButtonText || "Poznaj moje podejście");
    const [primaryButtonLink, setPrimaryButtonLink] = useState(initialData?.primaryButtonLink || "/#o-mnie");
    const [showZnanyLekarz, setShowZnanyLekarz] = useState<boolean>(initialData?.showZnanyLekarz ?? true);

    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = !!initialData?.id;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalImageUrl = initialData?.imageUrl || "/photo-horizontal.jpg";

            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                const uploadRes = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: formData,
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalImageUrl = uploadData.file.url;
                } else {
                    throw new Error("Nie udało się wgrać zdjęcia na serwer");
                }
            }

            const endpoint = isEditMode ? `/api/admin/hero/${initialData.id}` : "/api/admin/hero";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title, subtitle, imageUrl: finalImageUrl, layout, imageStyle,
                    showPrimaryButton, primaryButtonText, primaryButtonLink, showZnanyLekarz
                })
            });

            if (response.ok) {
                showToast("Szablon został zapisany pomyślnie!", "success");
                setTimeout(() => {
                    router.push("/admin/dashboard/landing");
                    router.refresh();
                }, 1000);
            } else {
                showToast("Błąd podczas zapisywania szablonu do bazy.", "error");
            }
        } catch  {
            showToast("Wystąpił błąd wgrywania zdjęcia lub zapisu.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    return {
        title, setTitle,
        subtitle, setSubtitle,
        layout, setLayout,
        imageStyle, setImageStyle,
        imageFile, handleImageChange,
        previewUrl,
        showPrimaryButton, setShowPrimaryButton,
        primaryButtonText, setPrimaryButtonText,
        primaryButtonLink, setPrimaryButtonLink,
        showZnanyLekarz, setShowZnanyLekarz,
        isLoading,
        handleSubmit, toast, hideToast, isEditMode
    }
}
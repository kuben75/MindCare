import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/useToast";
import {useConfirm} from "@/hooks/useConfirm";
import {useEffect, useRef, useState} from "react";
import {TInitialData} from "@/types/editor";


export const usePostForm = ({ initialData }: { initialData?: TInitialData }) => {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const confirm = useConfirm();

    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
    const [postId, setPostId] = useState<string | undefined>(initialData?.id);

    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const prevTitle = useRef(title);
    const prevContent = useRef(content);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saveStatus === "saving" || title !== prevTitle.current || content !== prevContent.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveStatus, title, content]);

    useEffect(() => {
        if (!title.trim() && !content) return;
        if (title === prevTitle.current && content === prevContent.current) return;

        setSaveStatus("saving");
        const timer = setTimeout(async () => {
            try {
                const isNew = !postId;
                const endpoint = isNew ? "/api/admin/posts" : `/api/admin/posts/${postId}`;
                const method = isNew ? "POST" : "PUT";

                const safeContent = content || '{"blocks":[]}';

                const response = await fetch(endpoint, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title || "Bez tytułu",
                        content: safeContent,
                        isPublished: isPublished
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (isNew && data.id) {
                        setPostId(data.id);
                        window.history.replaceState(null, '', `/admin/dashboard/blog/edit/${data.id}`);
                    }
                    prevTitle.current = title;
                    prevContent.current = content;
                    setLastSaved(new Date());
                    setSaveStatus("saved");
                } else {
                    setSaveStatus("error");
                }
            } catch (e) {
                setSaveStatus("error");
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [title, content, isPublished, postId]);

    const handleManualSubmit = async (publishStatus: boolean) => {
        if (!title.trim()) {
            showToast("Podaj tytuł artykułu!", "error");
            return;
        }
        setIsLoading(true);
        try {
            const isNew = !postId;
            const endpoint = isNew ? "/api/admin/posts" : `/api/admin/posts/${postId}`;
            const method = isNew ? "POST" : "PUT";

            const safeContent = content || '{"blocks":[]}';

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content: safeContent,
                    isPublished: publishStatus
                }),
            });

            if (response.ok) {
                window.onbeforeunload = null;
                showToast(publishStatus ? "Artykuł został opublikowany!" : "Szkic został zapisany.", "success");
                setTimeout(() => {
                    router.push("/admin/dashboard/blog");
                    router.refresh();
                }, 1000);
            } else {
                const errorData = await response.json();
                showToast(errorData.message || errorData.error || "Wystąpił błąd podczas zapisywania.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!postId) return router.push("/admin/dashboard/blog");

        const hasConfirmed = await confirm("Czy na pewno chcesz bezpowrotnie usunąć ten artykuł?", {
            title: "Usuwanie wpisu",
            confirmLabel: "Tak, usuń artykuł",
            type: "danger"
        });

        if (!hasConfirmed) return;

        try {
            window.onbeforeunload = null;
            const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Artykuł został pomyślnie usunięty.", "success");
                setTimeout(() => {
                    router.push("/admin/dashboard/blog");
                    router.refresh();
                }, 1000);
            }
        } catch (error) {
            showToast("Błąd przy usuwaniu artykułu.", "error");
        }
    };

    const handleGoBack = async () => {
        if (saveStatus === "saving" || title !== prevTitle.current || content !== prevContent.current) {
            const hasConfirmed = await confirm("Masz niezapisane zmiany. Trwa autosave lub dokument nie został zsynchronizowany. Czy na pewno chcesz wyjść tracąc zmiany?", {
                title: "Niezapisane zmiany",
                confirmLabel: "Wyjdź bez zapisywania",
                cancelLabel: "Zostań",
                type: "danger"
            });
            if (!hasConfirmed) return;
        }
        router.push("/admin/dashboard/blog");
    };
    return {
        title,
        setTitle,
        content,
        setContent,
        isPublished,
        setIsPublished,
        postId,
        isLoading,
        lastSaved,
        saveStatus,
        handleManualSubmit,
        handleDelete,
        handleGoBack,
        toast,
        hideToast
    }
}
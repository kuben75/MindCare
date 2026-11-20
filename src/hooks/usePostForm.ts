import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { useEffect, useRef, useState } from "react";
import { TInitialData } from "@/types/editor";

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
    // Autosave and manual save must never both create a post: the id lives in a ref (always
    // current), manual save waits for an in-flight autosave, and autosave skips while a manual
    // save runs.
    const postIdRef = useRef<string | undefined>(initialData?.id);
    const autosaveInFlight = useRef<Promise<void> | null>(null);
    const manualSaving = useRef(false);
    const rememberPostId = (id: string) => {
        postIdRef.current = id;
        setPostId(id);
    };

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
        if (isPublished) return;
        if (!title.trim() && !content) return;
        if (title === prevTitle.current && content === prevContent.current) return;

        setSaveStatus("saving");
        const timer = setTimeout(async () => {
            if (manualSaving.current || autosaveInFlight.current) return;
            const run = (async () => {
            try {
                const currentId = postIdRef.current;
                const isNew = !currentId;
                const endpoint = isNew ? "/api/admin/posts" : `/api/admin/posts/${currentId}`;
                const method = isNew ? "POST" : "PUT";

                const safeContent = content || '{"blocks":[]}';

                const response = await fetch(endpoint, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title || "Bez tytułu",
                        content: safeContent,
                        isPublished: false // Zawsze szkic przy automatycznym zapisie
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (isNew && data.id) {
                        rememberPostId(data.id);
                    }
                    prevTitle.current = title;
                    prevContent.current = content;
                    setLastSaved(new Date());
                    setSaveStatus("saved");
                } else {
                    setSaveStatus("error");
                }
            } catch {
                setSaveStatus("error");
            }
            })();
            autosaveInFlight.current = run;
            await run;
            autosaveInFlight.current = null;
        }, 3000);

        return () => clearTimeout(timer);
    }, [title, content, isPublished, postId]);

    const handleManualSubmit = async (publishStatus: boolean) => {
        if (!title.trim()) {
            showToast("Podaj tytuł artykułu!", "error");
            return;
        }
        setIsLoading(true);
        manualSaving.current = true;
        try {
            if (autosaveInFlight.current) await autosaveInFlight.current.catch(() => {});
            const currentId = postIdRef.current;
            const isNew = !currentId;
            const endpoint = isNew ? "/api/admin/posts" : `/api/admin/posts/${currentId}`;
            const method = isNew ? "POST" : "PUT";

            const safeContent = content || '{"blocks":[]}';

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    content: safeContent,
                    isPublished: publishStatus
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (isNew && data.id) {
                    rememberPostId(data.id);
                }
                setIsPublished(publishStatus);
                prevTitle.current = title;
                prevContent.current = content;

                window.onbeforeunload = null;
                showToast(publishStatus ? "Artykuł został opublikowany!" : "Szkic został zapisany.", "success");
                setTimeout(() => {
                    router.push("/admin/dashboard/blog");
                    router.refresh();
                }, 1000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                showToast(errorData.message || errorData.error || "Wystąpił błąd podczas zapisywania.", "error");
            }
        } catch {
            showToast("Wystąpił błąd połączenia z serwerem.", "error");
        } finally {
            manualSaving.current = false;
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
        } catch {
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
    };
};
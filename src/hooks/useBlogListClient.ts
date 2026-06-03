import {useState} from "react";
import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/useToast";
import {TPost} from "@/types/post";


export const useBlogListClient = ({ initialPosts }: { initialPosts: TPost[] }) => {

    const [posts, setPosts] = useState(initialPosts);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const movePost = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === posts.length - 1) return;

        const newPosts = [...posts];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        const temp = newPosts[index];
        newPosts[index] = newPosts[targetIndex];
        newPosts[targetIndex] = temp;

        const updatedPosts = newPosts.map((post, i) => ({ ...post, order: i }));
        setPosts(updatedPosts);
        setIsSaving(true);

        try {
            const updates = updatedPosts.map(p => ({ id: p.id, order: p.order }));
            const response = await fetch('/api/admin/posts/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });

            if (response.ok) {
                showToast("Kolejność wpisów została zapisana.", "success");
                router.refresh();
            }else {
                const errorData = await response.json();
                showToast(errorData.message || errorData.error || "Nie udało się zapisać kolejności. Spróbuj ponownie.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Nie udało się zapisać kolejności. Spróbuj ponownie.", "error");
            setPosts(posts);
        } finally {
            setIsSaving(false);
        }
    };
    return {
        posts,
        isSaving,
        movePost,
        toast,
        hideToast
    }
}
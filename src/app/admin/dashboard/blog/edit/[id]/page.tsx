import prisma from "@/infrastructure/prisma";
import {notFound} from "next/navigation";
import PostForm from "@/components/layout/PostForm";


export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    const post = await prisma.post.findUnique({
        where: {id}
    });
    if(!post) {
        notFound();
    }
    return (
        <PostForm initialData={{
            id: post.id,
            title: post.title,
            content: typeof post.content === "string" ? post.content : JSON.stringify(post.content),
            isPublished: post.isPublished
        }} />
    )
}
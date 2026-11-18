import prisma from "@/infrastructure/prisma";
import {notFound} from "next/navigation";
import PostForm from "@/components/layout/PostForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";


export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({message: "Invaid credentials"}, {status: 401});
    }
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
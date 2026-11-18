import PostForm from "@/components/layout/PostForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export default async function NewPostPage() {
    const admin = await requireAdmin();
if (!admin) {
    return NextResponse.json({message: "Invaid credentials"}, {status: 401});
}
    return <PostForm />;
}
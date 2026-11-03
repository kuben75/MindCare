import prisma from "@/infrastructure/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateUniqueSlug } from "@/utils/slug";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            return NextResponse.json({ error: "Post nie został znaleziony" }, { status: 404 });
        }
        return NextResponse.json(post, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const body = await req.json();
        const { title, content, isPublished } = body;

        if (!title || !content) {
            return NextResponse.json({ error: "Tytuł i treść są wymagane" }, { status: 400 });
        }

        const existingPost = await prisma.post.findUnique({
            where: { id }
        });

        if (!existingPost) {
            return NextResponse.json({ error: "Post nie został znaleziony" }, { status: 404 });
        }

        let slug = existingPost.slug;
        if (!existingPost.isPublished) {
            slug = await generateUniqueSlug(title, id);
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                title: title.trim(),
                content,
                slug,
                isPublished: isPublished ?? existingPost.isPublished
            }
        });

        return NextResponse.json(updatedPost, { status: 200 });
    } catch (error) {
        console.error("Błąd podczas aktualizacji posta:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        await prisma.post.delete({ where: { id } });
        return NextResponse.json({ message: "Post został usunięty" }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
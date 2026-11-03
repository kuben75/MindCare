import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/infrastructure/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateUniqueSlug } from "@/utils/slug";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, content, isPublished } = body;

        if (!title || !content) {
            return NextResponse.json({ error: "Tytuł i treść są wymagane" }, { status: 400 });
        }

        const slug = await generateUniqueSlug(title);

        const post = await prisma.post.create({
            data: {
                title: title.trim(),
                content,
                slug,
                isPublished: isPublished ?? true
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Błąd podczas tworzenia wpisu na blogu:", error);
        return NextResponse.json({ error: "Błąd serwera podczas zapisywania artykułu" }, { status: 500 });
    }
}
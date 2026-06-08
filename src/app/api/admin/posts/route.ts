import {getServerSession} from "next-auth";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";


export async function POST(req: Request) {

    const session = await getServerSession(authOptions)

    if(!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    try {
        const body = await req.json()
        const {title, content, isPublished} = body;

        if(!title || !content) {
            return NextResponse.json({error: "Tytuł i treść są wymagane"}, {status: 400})
        }
        const slug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")

        const post = await prisma.post.create({
            data: {title, content, slug, isPublished: isPublished ?? true
            }
        })
        return NextResponse.json(post, {status: 201})
    } catch {
        return NextResponse.json({error: "Błąd serwera"}, {status: 500})
    }
}
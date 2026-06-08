import prisma from "@/infrastructure/prisma";
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";


type Context = {params: Promise<{id: string}>};

export async function GET(req: Request, context: Context) {
    const {id} = await context.params

    try {
        const post = await prisma.post.findUnique({where: {id}})
        if (!post) {
            return NextResponse.json({error: "Post nie został znaleziony"}, {status: 404})
        }
        return NextResponse.json(post, {status: 200})
    }catch {
        return NextResponse.json({error: "Błąd serwera"}, {status: 500})
    }
}

export async function PUT(req: Request, context: Context) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    const {id} = await context.params

    try {
        const body = await req.json();
        const {title, content, isPublished} = body;

        if (!title || !content) {
            return NextResponse.json({error: "Tytuł i treść są wymagane"}, {status: 400})
        }
        const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
        const updatedPost = await prisma.post.update({
            where: {id},
            data: {title, content, slug, isPublished}
        })
        return NextResponse.json(updatedPost, {status: 200})
    }catch {
        return NextResponse.json({error: "Błąd serwera"}, {status: 500})
    }
}
export async function DELETE(req: Request, context: Context) {
    const session = await getServerSession(authOptions);
    if(!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    const {id} = await context.params

    try {
        await prisma.post.delete({where: {id}})
        return NextResponse.json({message: "Post został usunięty"}, {status: 200})
    }catch(error) {
        return NextResponse.json({error: "Błąd serwera"}, {status: 500})
    }
}

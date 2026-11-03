import prisma from "@/infrastructure/prisma";

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/ł/g, "l")
        .replace(/Ł/g, "l")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export async function generateUniqueSlug(title: string, currentPostId?: string): Promise<string> {
    const baseSlug = slugify(title) || "artykul";
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.post.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!existing || (currentPostId && existing.id === currentPostId)) {
            return slug;
        }

        counter++;
        slug = `${baseSlug}-${counter}`;
    }
}
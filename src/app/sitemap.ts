import { MetadataRoute } from "next";
import prisma from "@/infrastructure/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://www.psychologiaodbicia.com";

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
    ];

    try {
        const posts = await prisma.post.findMany({
             where: { published: true },
            select: { slug: true, updatedAt: true },
        });

        const postUrls = posts.map((p) => ({
            url: `${baseUrl}/blog/${p.slug}`,
            lastModified: p.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));

        return [...staticPages, ...postUrls];
    } catch {
        return staticPages;
    }
}
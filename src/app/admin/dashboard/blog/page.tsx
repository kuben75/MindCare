import prisma from "@/infrastructure/prisma";
import Link from "next/link";
import BlogListClient from "./BlogListClient";

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
    const posts = await prisma.post.findMany({
        orderBy: [
            { order: "asc" },
            { createdAt: "desc" }
        ]
    });

    return (
        <div className="p-4 sm:p-8 lg:p-10 animate-fade-in max-w-[1400px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                        Centrum zarządzania artykułami
                    </p>
                    <h1 className="text-3xl font-serif text-graphite dark:text-zinc-100 tracking-tight mb-2">
                        Studio Publikacji
                    </h1>
                    <p className="text-graphite/60 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                        Zarządzaj artykułami widocznymi dla pacjentów. Zmieniaj kolejność przyciskami ze strzałkami, aby
                        określić, który post pojawi się najwyżej na stronie.
                    </p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                    <Link
                        href="/admin/dashboard/blog/new"
                        className="group w-full md:w-auto px-6 py-3.5 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite rounded-2xl text-sm font-bold tracking-wide transition-all shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 active:scale-95"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                        </svg>
                        Napisz artykuł
                    </Link>
                </div>
            </div>

            <BlogListClient initialPosts={posts} />
        </div>
    );
}
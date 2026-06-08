import prisma from "@/infrastructure/prisma";
import Link from "next/link";
import { extractExcerpt, extractFirstImage } from "@/utils/editorUtils";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function PublicBlogPage() {
    const posts = await prisma.post.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }]
    });

    return (
        <main className="min-h-screen pt-32 pb-24 px-6 md:px-8 bg-beige-light/30 dark:bg-[#121212] transition-colors duration-500">
            <header className="mb-20 text-center max-w-2xl mx-auto">
                <span className="text-sage dark:text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">Baza wiedzy</span>
                <h1 className="text-4xl md:text-6xl font-serif text-graphite dark:text-zinc-100 mb-6 tracking-tight">Blog i Poradniki</h1>
                <div className="w-20 h-1 bg-sage dark:bg-emerald-500 mx-auto rounded-full mb-8"></div>
                <p className="text-graphite/70 dark:text-zinc-400 text-lg leading-relaxed">
                    Znajdziesz tutaj materiały psychoedukacyjne, wskazówki radzenia sobie w kryzysie oraz artykuły, które pomogą Ci lepiej zrozumieć siebie.
                </p>
            </header>

            {posts.length === 0 ? (
                <div className="max-w-2xl mx-auto text-center py-20 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-[2rem] border border-beige-dark/20 dark:border-zinc-800">
                    <p className="text-graphite/60 dark:text-zinc-400">Wkrótce pojawią się tutaj pierwsze artykuły. Zapraszam do powrotu później!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {posts.map((post) => {
                        const contentString = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
                        const coverImage = extractFirstImage(contentString);
                        const excerpt = extractExcerpt(contentString);

                        return (
                            <Link href={`/blog/${post.slug}`} key={post.id}
                                  className="group flex flex-col bg-white dark:bg-[#262626] rounded-[2rem] overflow-hidden border border-beige-dark/20 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                <div className="h-60 w-full relative bg-beige-light dark:bg-zinc-800 overflow-hidden">
                                    {coverImage ? (
                                        <Image src={coverImage} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-sage/10 dark:bg-emerald-900/10 text-sage/30 dark:text-emerald-500/20">
                                            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="text-sage dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                                        {new Date(post.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 font-medium mb-4 leading-snug group-hover:text-sage dark:group-hover:text-emerald-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-graphite/70 dark:text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-1">
                                        {excerpt || "Kliknij, aby przeczytać pełną treść artykułu."}
                                    </p>
                                    <div className="flex items-center gap-2 text-sage dark:text-emerald-400 font-bold text-xs uppercase tracking-widest border-t border-beige-dark/20 dark:border-zinc-700 pt-6">
                                        Czytaj dalej
                                        <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
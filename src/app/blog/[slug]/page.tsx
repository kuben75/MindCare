import edjsHTML from "editorjs-html";
import prisma from "@/infrastructure/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const edjsParser = edjsHTML();

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const post = await prisma.post.findFirst({
        where: { slug: slug, isPublished: true }
    });

    if (!post) {
        notFound();
    }

    let parsedContent: string[] = [];
    try {
        const jsonContent = typeof post.content === 'string' ? JSON.parse(post.content) : post.content;
        const parsed = edjsParser.parse(jsonContent);
        parsedContent = Array.isArray(parsed) ? parsed : [parsed as unknown as string];
    } catch  {
        parsedContent = [`<p>${typeof post.content === 'string' ? post.content : "Błąd ładowania."}</p>`];
    }

    return (
        <main className="min-h-screen pt-32 pb-24 px-4 sm:px-6 md:px-8 bg-beige-light/30 dark:bg-[#121212] transition-colors duration-500 overflow-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                    .prose figure, 
                    .prose img, 
                    .prose iframe, 
                    .prose video {
                        max-width: 100% !important;
                        height: auto !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                        border-radius: 1rem !important; 
                    }
                    .prose img {
                    max-height: 500px !important;
                    object-fit: cover !important;
                    max-width: 100% !important;
                    }
                    
                    .prose iframe {
                        width: 100% !important;
                        aspect-ratio: 16 / 9 !important;
                    }
                `
            }}/>

            <article
                className="max-w-3xl mx-auto bg-white dark:bg-[#262626] p-5 sm:p-8 md:p-16 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-beige-dark/20 dark:border-zinc-800 transition-colors duration-500 w-full">

                <Link href="/blog"
                      className="inline-flex items-center gap-2 text-graphite/40 dark:text-zinc-500 hover:text-sage dark:hover:text-emerald-400 transition-all font-bold text-[10px] uppercase tracking-widest mb-10 group w-max">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none"
                         stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/>
                    </svg>
                    Wróć do listy
                </Link>

                <header className="mb-12 sm:mb-16">
                    <p className="text-sage dark:text-emerald-400 font-bold text-[10px] mb-4 sm:mb-6 uppercase tracking-widest">
                        {new Date(post.createdAt).toLocaleDateString('pl-PL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-graphite dark:text-zinc-100 mb-8 leading-[1.15] break-words">
                        {post.title}
                    </h1>
                    <div className="w-16 sm:w-24 h-1 bg-sage/20 rounded-full"></div>
                </header>

                <div
                    className="prose prose-base sm:prose-lg md:prose-xl dark:prose-invert
                        prose-headings:font-serif prose-headings:text-graphite dark:prose-headings:text-zinc-100
                        prose-a:text-sage dark:prose-a:text-emerald-400 max-w-none text-graphite/80 dark:text-zinc-300 leading-relaxed


                        prose-img:max-w-[500px]
                        prose-img:shadow-xl

                        prose-blockquote:border-l-sage prose-blockquote:bg-sage/5 prose-blockquote:py-4 prose-blockquote:px-6 sm:prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:text-graphite dark:prose-blockquote:text-zinc-200 prose-blockquote:not-italic prose-blockquote:font-medium
                        prose-strong:text-graphite dark:prose-strong:text-zinc-100 break-words"
                    dangerouslySetInnerHTML={{ __html: parsedContent.join('') }}
                />

                <footer className="mt-16 sm:mt-24 pt-10 sm:pt-12 border-t border-beige-dark/20 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center text-sage font-serif text-xl sm:text-2xl font-bold shrink-0">
                        PK
                    </div>
                    <div>
                        <p className="text-graphite dark:text-zinc-100 font-serif font-bold text-base sm:text-lg">
                            Paulina Kawka-Mirek
                        </p>
                        <p className="text-[10px] sm:text-xs text-graphite/50 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">
                            Psycholog
                        </p>
                    </div>
                </footer>
            </article>
        </main>
    );
}
"use client";

import Link from "next/link";
import {Post} from "@/types/post";
import {Toast} from "@/components/ui/Toast";
import {motion, AnimatePresence} from "framer-motion";
import {useBlogListClient} from "@/hooks/useBlogListClient";

export default function BlogListClient({initialPosts}: { initialPosts: Post[] }) {
    const {
        posts,
        isSaving,
        movePost,
        toast,
        hideToast
    } = useBlogListClient({initialPosts});
    return (
        <div className="relative min-h-[400px]">
            <Toast toast={toast} onClose={hideToast}/>

            <div
                className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-4 sm:p-6 lg:p-8">

                <AnimatePresence mode="popLayout">
                    {posts.length === 0 ? (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="py-20 flex flex-col items-center justify-center text-center">
                            <div
                                className="w-20 h-20 bg-beige-light/50 dark:bg-zinc-800/80 rounded-[2rem] flex items-center justify-center mb-6 rotate-6 shadow-sm border border-beige-dark/20 dark:border-zinc-700/50">
                                <svg className="w-10 h-10 text-sage/80 dark:text-emerald-500/60" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-serif text-graphite dark:text-zinc-200 mb-2 tracking-tight">Katalog
                                postów jest pusty</h3>
                            <p className="text-sm font-medium text-graphite/50 dark:text-zinc-500 max-w-sm">
                                Napisz swój pierwszy artykuł ekspercki, aby budować zaufanie pacjentów i poprawić
                                pozycjonowanie w Google.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div
                                className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-beige-dark/20 dark:border-zinc-800 mb-2">
                                <div className="col-span-1"></div>
                                <div
                                    className="col-span-5 text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest">Tytuł
                                    Artykułu
                                </div>
                                <div
                                    className="col-span-2 text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest text-center">Data
                                </div>
                                <div
                                    className="col-span-2 text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest text-center">Status
                                </div>
                                <div
                                    className="col-span-2 text-[10px] font-bold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest text-right">Akcja
                                </div>
                            </div>

                            {posts.map((post, index) => (
                                <motion.div
                                    layout
                                    initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                    key={post.id}
                                    className="group grid grid-cols-1 sm:grid-cols-12 items-center gap-4 sm:gap-4 p-5 sm:px-6 sm:py-4 bg-white dark:bg-zinc-800/80 border border-beige-dark/20 dark:border-zinc-700/80 rounded-2xl hover:border-sage/40 dark:hover:border-emerald-500/40 hover:shadow-lg hover:shadow-sage/5 transition-all duration-300"
                                >
                                    <div
                                        className="col-span-1 flex sm:flex-col items-center gap-2 sm:gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => movePost(index, 'up')} disabled={index === 0 || isSaving}
                                                className="p-1 rounded bg-beige-light/50 dark:bg-zinc-700 hover:bg-sage/10 hover:text-sage dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:hover:bg-beige-light/50 active:scale-90">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                                      d="M5 15l7-7 7 7"/>
                                            </svg>
                                        </button>
                                        <button onClick={() => movePost(index, 'down')}
                                                disabled={index === posts.length - 1 || isSaving}
                                                className="p-1 rounded bg-beige-light/50 dark:bg-zinc-700 hover:bg-sage/10 hover:text-sage dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:hover:bg-beige-light/50 active:scale-90">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        <span
                                            className="sm:hidden text-[10px] font-bold text-graphite/40 uppercase tracking-widest ml-2">Zmień pozycję na stronie</span>
                                    </div>
                                    <div className="col-span-5 min-w-0">
                                        <h3 className="font-bold text-lg text-graphite dark:text-zinc-100 truncate group-hover:text-sage dark:group-hover:text-emerald-400 transition-colors">
                                            {post.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="text-[11px] font-semibold text-graphite/40 dark:text-zinc-500 uppercase tracking-widest">Slug:</span>
                                            <span
                                                className="text-xs text-graphite/60 dark:text-zinc-400 truncate">/{post.slug}</span>
                                        </div>
                                    </div>

                                    <div
                                        className="col-span-2 sm:text-center text-sm font-medium text-graphite/60 dark:text-zinc-400 flex items-center gap-2 sm:justify-center">
                                        <span
                                            className="sm:hidden text-[10px] font-bold text-graphite/40 uppercase tracking-widest">Utworzono:</span>
                                        {new Date(post.createdAt).toLocaleDateString('pl-PL', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </div>

                                    <div className="col-span-2 sm:text-center flex sm:justify-center">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm border ${
                                                post.isPublished
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
                                            }`}>
                                            <span
                                                className={`w-2 h-2 rounded-full ${post.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}/>
                                            {post.isPublished ? 'Publiczny' : 'Szkic'}
                                        </span>
                                    </div>

                                    <div className="col-span-2 flex justify-end mt-2 sm:mt-0">
                                        <Link
                                            href={`/admin/dashboard/blog/edit/${post.id}`}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-beige-light/30 border border-beige-dark/20 text-graphite text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-sage hover:border-sage hover:text-white dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-emerald-500 dark:hover:border-emerald-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                            </svg>
                                            Edytuj
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
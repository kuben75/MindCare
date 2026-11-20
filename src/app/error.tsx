"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Shown instead of a blank "Application error" screen when a page throws. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-beige-light">
            <span className="text-sage font-serif text-5xl md:text-7xl font-light">Ups</span>
            <h1 className="text-2xl md:text-3xl font-serif text-graphite mt-4">Coś poszło nie tak</h1>
            <p className="text-graphite/60 text-sm md:text-base mt-2 max-w-md">
                Nie udało się wczytać tej strony. Spróbuj ponownie za chwilę — jeśli problem się powtarza, skontaktuj się z gabinetem.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                    onClick={reset}
                    className="px-6 py-3 rounded-xl bg-sage text-white text-sm font-semibold hover:bg-[#8ea38a] transition-all shadow-sm"
                >
                    Spróbuj ponownie
                </button>
                <Link href="/" className="px-6 py-3 rounded-xl border border-beige-dark/40 text-graphite text-sm font-semibold hover:border-sage transition-all">
                    Strona główna
                </Link>
            </div>
        </main>
    );
}

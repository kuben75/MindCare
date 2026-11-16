import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-beige-light">
            <span className="text-sage font-serif text-6xl md:text-8xl font-light">404</span>
            <h1 className="text-2xl md:text-3xl font-serif text-graphite mt-4">Strona nie została odnaleziona</h1>
            <p className="text-graphite/60 text-sm md:text-base mt-2 max-w-md">
                Adres, którego szukasz, mógł zostać przeniesiony lub nigdy nie istniał.
            </p>
            <Link
                href="/"
                className="mt-8 px-6 py-3 rounded-xl bg-sage text-white text-sm font-semibold hover:bg-[#8ea38a] transition-all shadow-sm"
            >
                Wróć do strony głównej
            </Link>
        </main>
    );
}
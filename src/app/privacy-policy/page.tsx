"use client";

import { motion } from "framer-motion";
import {usePathname} from "next/navigation";
import {useSettings} from "@/context/SettingsContext";

export default function PrivacyPolicyPage() {
    const pathname = usePathname();
    const settings = useSettings();

    if (pathname?.startsWith("/admin")) {
        return null;
    }
    return (
        <main className="min-h-screen bg-[#faf9f7] dark:bg-[#1a1a1a] pt-32 pb-24 px-4 md:px-8 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto bg-white dark:bg-[#262626] p-8 md:p-12 rounded-3xl shadow-sm border border-beige-dark/20 dark:border-zinc-700 transition-colors"
            >
                <h1 className="text-3xl md:text-4xl font-serif text-graphite dark:text-zinc-100 mb-2">Polityka Prywatności</h1>
                <p className="text-sm text-graphite/50 dark:text-zinc-400 mb-8 pb-8 border-b border-beige-dark/20 dark:border-zinc-700">Klauzula informacyjna RODO — Aktualizacja: Czerwiec 2026</p>

                <div className="space-y-8 text-sm md:text-base text-graphite/80 dark:text-zinc-300 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">1. Administrator Danych Osobowych</h2>
                        <p>
                            Administratorem Twoich danych osobowych jest <strong>{settings?.clinicName || "Paulinę Kawkę-Mirek"}</strong>, prowadząca działalność gospodarczą. W sprawach związanych z przetwarzaniem danych, modyfikacją lub ich usunięciem, można kontaktować się bezpośrednio poprzez adres e-mail udostępniony w sekcji kontaktowej strony.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">2. Cel i podstawa prawna przetwarzania danych</h2>
                        <p>Twoje dane osobowe (imię, nazwisko, numer telefonu, adres e-mail, a w przypadku firm – dane do faktury) przetwarzane są zgodnie z RODO w celu:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Realizacji usług i rezerwacji (Art. 6 ust. 1 lit. b RODO):</strong> Umożliwienia zapisu na wizytę, zarządzania terminami w kalendarzu oraz obsługi powiadomień e-mail/SMS o statusie rezerwacji.</li>
                            <li><strong>Zapisów na listę rezerwową (Art. 6 ust. 1 lit. a RODO):</strong> Przetwarzania danych w celu kontaktu w przypadku zwolnienia się preferowanego terminu sesji (na podstawie Twojej dobrowolnej zgody).</li>
                            <li><strong>Obowiązków prawnych i rozliczeń (Art. 6 ust. 1 lit. c RODO):</strong> Wystawiania rachunków, faktur oraz prowadzenia sprawozdawczości księgowo-podatkowej.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">3. Odbiorcy danych (Procesorzy)</h2>
                        <p>W celu prawidłowego funkcjonowania systemu rezerwacji oraz obsługi płatności, Twoje dane mogą być przekazywane zaufanym podmiotom zewnętrznym:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Stripe Payments Europe, Ltd.</strong> — w celu bezpiecznej autoryzacji i przetwarzania płatności bezgotówkowych online.</li>
                            <li>Dostawcom usług hostingu oraz systemów powiadomień e-mail/SMS obsługujących infrastrukturę techniczną gabinetu.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">4. Notatki z sesji i dane wrażliwe</h2>
                        <p>
                            Wszelkie prywatne notatki, diagnozy i obserwacje sporządzane przez terapeutę w trakcie lub po sesji stanowią tajemnicę zawodową. Mają one charakter wyłącznie pomocniczy, są przechowywane w odizolowanym i szyfrowanym środowisku cyfrowym (zgodnie z najwyższymi standardami bezpieczeństwa) i nigdy nie są współdzielone z procesorami technologicznymi ani osobami trzecimi, z wyjątkiem sytuacji bezwzględnie nakazanych przez przepisy prawa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">5. Twoje prawa</h2>
                        <p>Masz pełne prawo do wglądu w swoje dane, ich poprawiania, ograniczenia przetwarzania oraz przenoszenia. Prawo do całkowitego usunięcia danych ("prawo do bycia zapomnianym") może zostać ograniczone wyłącznie w zakresie, w jakim administrator jest prawnie zobowiązany do archiwizacji dokumentacji medycznej lub podatkowej.</p>
                    </section>

                </div>
            </motion.div>
        </main>
    );
}
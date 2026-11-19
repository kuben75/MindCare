"use client";

import { motion } from "framer-motion";
import {usePathname} from "next/navigation";
import {useSettings} from "@/context/SettingsContext";

export default function TermsOfServicePage() {
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
                <h1 className="text-3xl md:text-4xl font-serif text-graphite dark:text-zinc-100 mb-2">Regulamin</h1>
                <p className="text-sm text-graphite/50 dark:text-zinc-400 mb-8 pb-8 border-b border-beige-dark/20 dark:border-zinc-700">Ostatnia aktualizacja: Czerwiec 2026</p>

                <div className="space-y-8 text-sm md:text-base text-graphite/80 dark:text-zinc-300 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">§ 1. Postanowienia ogólne</h2>
                        <p>
                            Niniejszy regulamin określa zasady rezerwacji terminów, dokonywania płatności oraz świadczenia usług psychologicznych w gabinecie prowadzonym przez <strong>{settings?.clinicName || "Paulinę Kawka-Mirek"}</strong>. Finalizacja rezerwacji poprzez stronę internetową lub zgłoszenie telefoniczne oznacza pełną akceptację poniższych warunków.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">§ 2. Płatności i Metody Zakupu</h2>
                        <p>Gabinet obsługuje dwa kanały rezerwacji wizyt:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Rezerwacja online:</strong> Po zapisie przez stronę wizyta otrzymuje status <em>Oczekująca</em>, a pacjent dostaje wiadomość e-mail z prośbą o kontakt z gabinetem w celu ustalenia formy i terminu płatności. Wizyta zostaje potwierdzona (status <em>Opłacona</em>) po zaksięgowaniu płatności przez gabinet, o czym pacjent jest informowany e-mailem. Rezerwacja nieopłacona w ciągu 72 godzin od zapisu zostaje automatycznie anulowana, a termin zwolniony.</li>
                            <li><strong>Rezerwacja telefoniczna lub bezpośrednia:</strong> Wizytę wprowadza do systemu gabinet. Forma i termin płatności ustalane są indywidualnie podczas kontaktu z pacjentem.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">§ 3. Polityka Zwrotów i Odwoływania Wizyt</h2>
                        <p>Dbając o szacunek do czasu terapeuty oraz innych pacjentów oczekujących na wolne terminy, wprowadza się rygorystyczne ramy czasowe zwrotów:</p>

                        <div className="my-4 overflow-hidden rounded-xl border border-beige-dark/30 dark:border-zinc-700 text-xs sm:text-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-beige-light/40 dark:bg-zinc-800/50 text-graphite/60 dark:text-zinc-400 border-b border-beige-dark/30 dark:border-zinc-700">
                                    <th className="p-3 font-bold">Czas odwołania sesji</th>
                                    <th className="p-3 font-bold">Koszt operacji</th>
                                    <th className="p-3 font-bold">Forma zwrotu środków</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-beige-dark/20 dark:divide-zinc-700/60 dark:bg-zinc-900/10">
                                <tr>
                                    <td className="p-3 font-medium">Powyżej 24 godzin przed</td>
                                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">0 zł (Bezpłatnie)</td>
                                    <td className="p-3">100% zwrotu przelewem lub w uzgodniony sposób</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Poniżej 24 godzin lub No-show</td>
                                    <td className="p-3 text-red-500 font-bold">100% ceny wizyty</td>
                                    <td className="p-3 opacity-60">Środki nie podlegają zwrotowi</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>W przypadku terminowego anulowania opłaconej wizyty (powyżej 24 godzin przed terminem) gabinet kontaktuje się z pacjentem i zwraca pełną opłatę przelewem lub w inny uzgodniony sposób. Anulowanie nieopłaconej rezerwacji jest zawsze bezpłatne.</li>
                            <li>W sytuacjach losowych, w których wizyta zostanie odwołana z winy terapeuty, pacjentowi przysługuje natychmiastowy pełny zwrot kosztów lub pierwszeństwo w bezpłatnym wyborze nowego, dogodnego terminu.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">§ 4. Lista Rezerwowa</h2>
                        <p>
                            Zapis na listę rezerwową (kolejkę oczekujących) nie stanowi gwarancji odbycia wizyty ani nie nakłada na pacjenta obowiązku płatności. Jest to usługa wyłącznie informacyjna. Umówienie wizyty ze strefy rezerwowej następuje dopiero po bezpośrednim kontakcie personelu gabinetu z pacjentem i ręcznym zatwierdzeniu terminu w systemie.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 mb-3">§ 5. Tajemnica zawodowa</h2>
                        <p>
                            Wszystkie informacje wnoszone przez pacjenta w procesie rezerwacji oraz w trakcie trwania terapii są objęte bezwzględną tajemnicą zawodową. Zwolnienie z tajemnicy następuje wyłącznie w sytuacjach określonych polskim prawem – gdy istnieje bezpośrednie zagrożenie życia lub zdrowia pacjenta bądź osób trzecich.
                        </p>
                    </section>

                </div>
            </motion.div>
        </main>
    );
}
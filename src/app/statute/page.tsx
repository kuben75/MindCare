export default function TermsOfServicePage() {
    return (
        <main className="min-h-screen bg-[#faf9f7] pt-32 pb-24 px-4 md:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-beige-dark/20">
                <h1 className="text-3xl md:text-4xl font-serif text-graphite mb-2">Regulamin gabinetu</h1>
                <p className="text-sm text-graphite/50 mb-8 pb-8 border-b border-beige-dark/20">Ostatnia aktualizacja: Maj 2026</p>

                <div className="space-y-8 text-sm md:text-base text-graphite/80 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">§ 1. Postanowienia ogólne</h2>
                        <p>
                            Niniejszy regulamin określa zasady świadczenia usług psychologicznych i terapeutycznych w gabinecie prowadzonym przez Paulinę Kawkę-Mirek. Rezerwacja wizyty jest równoznaczna z akceptacją niniejszego regulaminu.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">§ 2. Rezerwacja i odwoływanie wizyt</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Rezerwacji terminu można dokonać za pośrednictwem systemu rezerwacji na stronie internetowej.</li>
                            <li><strong>Wizytę można odwołać bezpłatnie najpóźniej na 24 godziny przed zaplanowanym terminem.</strong></li>
                            <li>W przypadku odwołania wizyty na mniej niż 24 godziny przed jej rozpoczęciem lub w przypadku braku stawiennictwa ("no-show"), pacjent zobowiązany jest do uiszczenia pełnej opłaty za zarezerwowany czas, ponieważ termin ten nie może zostać zaoferowany innej osobie.</li>
                            <li>W sytuacjach losowych ze strony terapeuty, wizyta może zostać odwołana w każdym czasie, a pacjentowi zostanie zaproponowany nowy termin.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">§ 3. Tajemnica zawodowa</h2>
                        <p>
                            Wszystkie informacje przekazywane przez pacjenta podczas sesji są objęte ścisłą tajemnicą zawodową. Wyjątkiem są sytuacje, w których zdrowie, życie pacjenta lub osób trzecich jest bezpośrednio zagrożone, co zwalnia terapeutę z zachowania tajemnicy w zakresie niezbędnym do ochrony tego życia lub zdrowia (zgodnie z obowiązującym prawem).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">§ 4. Płatności</h2>
                        <p>
                            Płatność za sesję odbywa się z góry za pośrednictwem bezpiecznego systemu płatności online udostępnionego przy rezerwacji, lub (w przypadku wyraźnego ustalenia z terapeutą) gotówką/kartą na miejscu w gabinecie.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}
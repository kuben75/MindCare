export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#faf9f7] pt-32 pb-24 px-4 md:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-beige-dark/20">
                <h1 className="text-3xl md:text-4xl font-serif text-graphite mb-2">Polityka Prywatności</h1>
                <p className="text-sm text-graphite/50 mb-8 pb-8 border-b border-beige-dark/20">Klauzula informacyjna RODO</p>

                <div className="space-y-8 text-sm md:text-base text-graphite/80 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">1. Administrator Danych Osobowych</h2>
                        <p>
                            Administratorem Twoich danych osobowych jest Paulina Kawkę-Mirek. W sprawach związanych z przetwarzaniem danych można kontaktować się poprzez adres e-mail udostępniony na stronie.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">2. Cel i podstawa prawna przetwarzania danych</h2>
                        <p>Twoje dane osobowe (imię, nazwisko, numer telefonu, adres e-mail) przetwarzane są w celu:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Umożliwienia rezerwacji i zarządzania wizytami w kalendarzu.</li>
                            <li>Świadczenia usług psychologicznych i terapeutycznych.</li>
                            <li>Wystawienia rachunku/faktury i prowadzenia rozliczeń księgowych.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">3. Notatki z sesji i dane wrażliwe</h2>
                        <p>
                            W ramach prowadzonej dokumentacji mogą być sporządzane prywatne notatki z sesji. Mają one charakter wyłącznie pomocniczy dla terapeuty i podlegają najwyższym standardom ochrony (tajemnica zawodowa). Nigdy nie są one udostępniane osobom trzecim bez wyraźnego nakazu sądu.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">4. Prawa użytkownika</h2>
                        <p>Masz prawo do:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Dostępu do swoich danych osobowych oraz otrzymania ich kopii.</li>
                            <li>Sprostowania (poprawiania) swoich danych.</li>
                            <li>Usunięcia danych ("prawo do bycia zapomnianym"), o ile nie stoi to w sprzeczności z obowiązkiem przechowywania dokumentacji medycznej i księgowej narzuconym przez prawo.</li>
                            <li>Wycofania zgody na przetwarzanie danych (jeśli była ona podstawą przetwarzania).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-graphite mb-3">5. Okres przechowywania danych</h2>
                        <p>
                            Twoje dane kontaktowe oraz finansowe przechowywane są przez okres wymagany przepisami prawa podatkowego. Dokumentacja psychologiczna przechowywana jest zgodnie z wytycznymi ustawy o zawodzie psychologa.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}
"use client";
import {useSettings} from "@/context/SettingsContext";

export const Specializations = () => {
    const settings = useSettings();
    return (
        <section id="specjalizacja" className="relative w-full py-20 bg-beige-light border-t border-beige-dark/20 overflow-hidden">

            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sage/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-beige-dark/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>


            <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

                <div className="mb-16 md:mb-20">
                    <span className="text-sage font-semibold tracking-widest uppercase text-sm">Obszary wsparcia</span>
                    <h2 className="text-3xl md:text-4xl text-graphite font-serif mt-3">
                        W czym mogę Ci pomóc?
                    </h2>
                    <p className="mt-4 text-graphite/70 max-w-2xl font-light">
                        Swoją pracę opieram na aktualnej wiedzy naukowej i standardach etycznych.
                        Oferuję wsparcie w sytuacjach trudności emocjonalnych, kryzysów życiowych oraz długotrwałego
                        przeciążenia.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-beige-dark/10 hover:border-sage/30 transition-colors group">
                        <div className="w-12 h-12 bg-beige-light rounded-lg flex items-center justify-center text-sage mb-6 group-hover:bg-sage group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl text-graphite font-medium mb-3">Trauma i PTSD</h3>
                        <p className="text-graphite/70 text-sm leading-relaxed mb-4">
                            Wsparcie dla osób zmagających się z Zespołem Stresu Pourazowego (PTSD) oraz skutkami traumy.
                            Praca nad zrozumieniem mechanizmów, psychoedukacja i odzyskiwanie poczucia bezpieczeństwa po
                            trudnych wydarzeniach.
                        </p>
                        <ul className="text-xs text-graphite/60 space-y-2 list-disc list-inside">
                            <li>Traumatologia</li>
                            <li>Przewlekły stres</li>
                            <li>Kryzysy życiowe</li>
                        </ul>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-beige-dark/10 hover:border-sage/30 transition-colors group">
                        <div className="w-12 h-12 bg-beige-light rounded-lg flex items-center justify-center text-sage mb-6 group-hover:bg-sage group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl text-graphite font-medium mb-3">Spektrum Autyzmu (ASD)</h3>
                        <p className="text-graphite/70 text-sm leading-relaxed mb-4">
                            Wsparcie dzieci ze spektrum autyzmu oraz ich rodzin. Praca nad zrozumieniem specyfiki
                            funkcjonowania,
                            metody wspierające rozwój w środowisku domowym oraz codzienne strategie radzenia sobie z
                            wyzwaniami.
                        </p>
                        <ul className="text-xs text-graphite/60 space-y-2 list-disc list-inside">
                            <li>Psychoedukacja rodziców</li>
                            <li>Wsparcie w środowisku domowym</li>
                            <li>Dostosowanie aktywności</li>
                        </ul>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-beige-dark/10 hover:border-sage/30 transition-colors group">
                        <div className="w-12 h-12 bg-beige-light rounded-lg flex items-center justify-center text-sage mb-6 group-hover:bg-sage group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
                            </svg>
                        </div>
                        <h3 className="text-xl text-graphite font-medium mb-3">Młodzież i Cyfrowy Świat</h3>
                        <p className="text-graphite/70 text-sm leading-relaxed mb-4">
                            Specjalizuję się w relacji między psychiką a światem online. Pomagam młodym dorosłym i
                            nastolatkom
                            w problemach z samooceną, wizerunkiem i presją mediów społecznościowych.
                        </p>
                        <ul className="text-xs text-graphite/60 space-y-2 list-disc list-inside">
                            <li>Poczucie własnej wartości</li>
                            <li>Trudności okresu dorastania</li>
                            <li>Wpływ social mediów</li>
                        </ul>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-beige-dark/10 hover:border-sage/30 transition-colors group">
                        <div className="w-12 h-12 bg-beige-light rounded-lg flex items-center justify-center text-sage mb-6 group-hover:bg-sage group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl text-graphite font-medium mb-3">Redukcja Szkód</h3>
                        <p className="text-graphite/70 text-sm leading-relaxed mb-4">
                            Praca z osobami używającymi substancji psychoaktywnych w podejściu <strong>Harm
                            Reduction</strong>.
                            Skupienie na bezpieczeństwie, relacji i minimalizowaniu negatywnych skutków zachowań
                            ryzykownych.
                        </p>
                        <ul className="text-xs text-graphite/60 space-y-2 list-disc list-inside">
                            <li>Uzależnienia</li>
                            <li>Zachowania ryzykowne</li>
                            <li>Bezpieczna relacja</li>
                        </ul>
                    </div>

                </div>

                <div className="relative bg-white/90 backdrop-blur-sm p-8 mt-8 md:mt-12 md:p-10 rounded-2xl shadow-sm border border-beige-dark/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">

                        <div className="flex flex-col gap-3 text-center md:text-left">
                            <h3 className="text-2xl text-graphite font-serif">Dbam o Twoje zaufanie</h3>
                            <p className="text-graphite/70 font-light max-w-lg">
                                Opinie moich pacjentów są dla mnie najważniejszą wizytówką. Sprawdź zweryfikowane
                                komentarze na moim profilu.
                            </p>

                            <div className="flex justify-center md:justify-start gap-1 text-[#00b39b] mt-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path
                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                ))}
                                <span className="text-graphite/60 text-sm ml-2 font-medium">5.0 / 5.0</span>
                            </div>
                        </div>

                        <a
                            href={settings?.znanyLekarzUrl || "https://www.znanylekarz.pl/paulina-kawka-mirek/psycholog/wronki"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-white border border-[#00b39b] text-[#00b39b] hover:bg-[#00b39b] hover:text-white rounded-md transition-all font-medium shadow-sm flex items-center gap-2"
                        >
                            <span>Przejdź do ZnanyLekarz.pl</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                        </a>

                    </div>
                </div>
            </div>

        </section>
    );
};
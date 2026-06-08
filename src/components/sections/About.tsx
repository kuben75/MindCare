import Image from "next/image";

export const About = () => {
    return (
        <section id="o-mnie" className="w-full py-20 md:py-32 bg-white relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-20 w-96 h-96 bg-beige-light rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-20 right-0 w-80 h-80 bg-sage/10 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">

                    <div className="w-full md:w-1/2 flex flex-col gap-6 order-2 md:order-1">

                        <div>
                            <span className="text-sage font-semibold tracking-widest uppercase text-sm">O mnie</span>
                            <h2 className="text-3xl md:text-4xl text-graphite font-serif mt-3 leading-tight">
                                Psycholog z wyboru, <br />
                                <span className="italic text-graphite/70">człowiek z doświadczenia.</span>
                            </h2>
                        </div>

                        <p className="text-graphite/80 leading-relaxed font-light text-lg">
                            Jestem <strong>psychologiem</strong> ze specjalnością kliniczną. Obecnie realizuję specjalizację z <strong>traumatologii</strong>, co pozwala mi pracować z osobami doświadczającymi skutków traumy, przewlekłego stresu i obciążających wydarzeń życiowych.
                        </p>

                        <p className="text-graphite/80 leading-relaxed font-light text-lg">
                            Szczególnie bliski jest mi temat relacji między psychiką a światem online. Badałam związek między poczuciem własnej wartości a mediami społecznościowymi – to ważny element mojego myślenia o zdrowiu psychicznym, zwłaszcza w pracy z młodymi dorosłymi.
                        </p>

                        <div className="relative mt-2 p-6 md:p-8 bg-beige-light rounded-2xl border-l-4 border-sage shadow-sm">
                            <div className="absolute -top-4 -left-2 text-6xl text-sage opacity-20 font-serif">&quot;</div>
                            <p className="text-graphite italic font-medium leading-relaxed relative z-10">
                                Mam również osobiste doświadczenie ciężkiej choroby nowotworowej. To doświadczenie w naturalny sposób pogłębiło moją wrażliwość na cierpienie, bezradność i lęk. Nauczyło mnie ono szczególnego szacunku do granic, siły i kruchości drugiego człowieka.
                            </p>
                        </div>

                        <p className="text-graphite/80 leading-relaxed font-light text-sm mt-2">
                            Wierzę, że zdrowie psychiczne buduje się nie tylko w gabinecie, ale także w jakości relacji i momentach zatrzymania. Jeśli szukasz miejsca, w którym możesz zostać wysłuchanym bez oceny – jesteś we właściwym miejscu.
                        </p>

                        <div className="pt-4 flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-3 text-graphite/80 font-light text-xs md:text-sm">

                 <span className="bg-white px-3 py-1 rounded-full border border-beige-dark shadow-sm">
                   Magister Psychologii
                 </span>

                                <span className="bg-white px-3 py-1 rounded-full border border-beige-dark shadow-sm">
                   Traumatologia
                 </span>

                                <div className="group relative bg-white px-3 py-1 rounded-full border border-beige-dark shadow-sm cursor-help hover:border-sage hover:text-sage transition-colors inline-flex items-center">
                                    <span>Członek APA ⓘ</span>

                                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-graphite text-white text-xs rounded-lg shadow-xl z-50 text-center leading-relaxed pointer-events-none">
                                        <strong>American Psychological Association</strong> <br/>
                                        Największa organizacja psychologiczna na świecie, wyznaczająca najwyższe standardy etyczne i naukowe.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-graphite"></div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div className="w-full md:w-1/2 flex justify-center md:justify-end order-1 md:order-2">
                        <div className="relative w-full max-w-sm md:max-w-md group">
                            <div className="absolute top-4 right-4 w-full h-full border-2 border-sage rounded-2xl z-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"></div>
                            <div className="relative w-full h-auto rounded-2xl overflow-hidden shadow-2xl z-10 bg-beige-light">
                                <Image
                                    src="/hero-photo.jpg"
                                    alt="Paulina Kawka-Mirek"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    style={{ width: '100%', height: 'auto' }}
                                    className="transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
"use client";
import Image from "next/image";
import Link from "next/link";
import {useSettings} from "@/context/SettingsContext";

export const Hero = () => {
    const settings = useSettings();
    return (
        <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 bg-beige-light overflow-hidden">

            <div className="absolute top-20 left-10 w-72 h-72 bg-sage/10 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col lg:flex-row items-center relative z-10">

                <div className="w-full lg:w-[65%] relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg border-[6px] border-beige-dark/30 bg-beige-dark">
                    <Image
                        src="/photo-horizontal.jpg"
                        alt="Paulina Kawka-Mirek - Psycholog"
                        fill
                        className="object-cover object-left"
                        priority
                    />
                </div>

                <div className="w-full lg:w-[45%] bg-beige-light lg:bg-beige-light/95 lg:backdrop-blur-md p-8 lg:p-12 rounded-2xl lg:shadow-xl relative z-20 mt-8 lg:mt-0 lg:-ml-16 border border-transparent lg:border-beige-dark/50">

                    <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl text-graphite font-light leading-[1.15] tracking-wide">
                        Prawdziwa zmiana <br className="hidden sm:block" />
                        zaczyna się od <br />
                        <span className="text-sage font-medium italic">zrozumienia</span>
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-graphite/90 font-light leading-relaxed">
                        ...nie od oceniania i nie od gotowych recept, ale od uważnego przyjrzenia się temu, co dzieje się tu i teraz.
                    </p>

                    <div className="mt-10 md:mt-12 flex flex-col gap-6">
                        <Link
                            href="#o-mnie"
                            className="group relative inline-flex items-center gap-4 text-graphite font-medium text-lg tracking-wide hover:text-sage transition-colors duration-300 w-max"
                        >
                            Poznaj moje podejście
                            <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-sage transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <a
                            href={settings?.znanyLekarzUrl || "https://www.znanylekarz.pl/paulina-kawka-mirek/psycholog/wronki"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-sm text-graphite/60 hover:text-sage transition-colors w-max group"
                        >
                            <div className="flex text-[#00b39b] group-hover:opacity-80 transition-opacity">
                                {[1,2,3,4,5].map(i => (
                                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <span className="border-b border-transparent group-hover:border-sage transition-colors">
                Sprawdź opinie na <strong>ZnanyLekarz.pl</strong>
              </span>
                        </a>

                    </div>

                </div>
            </div>
        </section>
    );
};
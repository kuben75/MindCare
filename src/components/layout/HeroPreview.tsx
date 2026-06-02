"use client";
import Image from "next/image";
import Link from "next/link";
import { THeroProps } from "@/types/hero";
import { useSettings } from "@/context/SettingsContext";

export const HeroPreview = ({
                                title, subtitle, imageUrl, layout, imageStyle,
                                showPrimaryButton = true, primaryButtonText = "Poznaj moje podejście", primaryButtonLink = "/#o-mnie",
                                showZnanyLekarz = true, isPreview = false
                            }: THeroProps) => {
    const settings = useSettings();

    const getAspectRatioClass = () => {
        if (imageStyle === "VERTICAL") return "aspect-[3/4]";
        if (imageStyle === "SQUARE") return "aspect-square";
        return "aspect-[3/2]";
    };

    const parseTitle = (rawText: string) => {
        if (!rawText) return "Wpisz tytuł...";
        return rawText
            .replace(/\n/g, "<br/>")
            .replace(/\*(.*?)\*/g, "<span class='text-sage font-medium italic'>$1</span>");
    };

    return (
        <section className="relative w-full py-32 pb-16 md:pt-40 bg-beige-light overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sage/10 rounded-full blur-3xl -z-10"></div>

            <div className={`max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center relative z-10 gap-8 lg:gap-0
                ${layout === 'TEXT_LEFT' ? 'lg:flex-row-reverse' : 'lg:flex-row'}
            `}>

                <div className={`w-full lg:w-[55%] relative rounded-2xl overflow-hidden shadow-lg border-[6px] border-beige-dark/30 bg-beige-dark z-10 ${getAspectRatioClass()}`}>
                    <Image src={imageUrl || "/photo-horizontal.jpg"} alt="Paulina Kawka-Mirek" fill className="object-cover object-center" priority />
                </div>

                <div className={`w-full lg:w-[50%] bg-beige-light lg:bg-beige-light/95 lg:backdrop-blur-md p-8 lg:p-12 rounded-2xl lg:shadow-xl relative z-20 border border-transparent lg:border-beige-dark/50 
                    ${layout === 'TEXT_LEFT' ? 'lg:-mr-16' : 'lg:-ml-16'}
                `}>

                    <h1 className="text-4xl sm:text-5xl lg:text-5xl text-graphite font-light leading-[1.15] tracking-wide"
                        dangerouslySetInnerHTML={{ __html: parseTitle(title) }}
                    />

                    <p className="mt-6 text-lg text-graphite/90 font-light leading-relaxed">
                        {subtitle || "Tutaj pojawi się podtytuł..."}
                    </p>

                    <div className="mt-10 flex flex-col gap-5">

                        {showPrimaryButton && (
                            <Link
                                href={primaryButtonLink}
                                className={`group relative inline-flex items-center gap-4 text-graphite font-medium text-lg tracking-wide hover:text-sage transition-colors duration-300 w-max ${isPreview ? 'pointer-events-none' : ''}`}
                            >
                                {primaryButtonText}
                                <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        )}

                        {showZnanyLekarz && (
                            <a
                                href={settings?.znanyLekarzUrl || "https://www.znanylekarz.pl/paulina-kawka-mirek/psycholog/wronki"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 text-sm text-graphite/60 hover:text-sage transition-colors w-max group mt-2 ${isPreview ? 'pointer-events-none' : ''}`}
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
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
};
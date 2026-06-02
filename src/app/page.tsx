import { Hero } from "@/components/sections/Hero";
import {About} from "@/components/sections/About";
import {Specializations} from "@/components/sections/Specializations";
import {Calendar} from "@/components/sections/Calendar";
import {Contact} from "@/components/sections/Contact";
import prisma from "@/infrastructure/prisma";
import {HeroPreview} from "@/components/layout/HeroPreview";
import {Pricing} from "@/components/sections/Pricing";

export const dynamic = "force-dynamic";

export default async function Home() {
    const activeHero = await prisma.heroTemplate.findFirst({
        where: {isActive: true},
    });

    return (
        <div className="flex flex-col w-full">
            {activeHero ? (
                <HeroPreview title={activeHero.title} subtitle={activeHero.subtitle} imageUrl={activeHero.imageUrl || "/photo-horizontal.jpg"} layout={activeHero.layout} imageStyle={activeHero.imageStyle} showPrimaryButton={activeHero.showPrimaryButton} primaryButtonText={activeHero.primaryButtonText} primaryButtonLink={activeHero.primaryButtonLink} showZnanyLekarz={activeHero.showZnanyLekarz}  />
            ): (
                <Hero />
                )}
            <About />
            <Specializations />
            <Pricing />
            <Calendar />
            <Contact />
        </div>
    );
}
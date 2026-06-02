import prisma from "@/infrastructure/prisma";
import { PricingList } from "./PricingList";

export const Pricing = async () => {
    const activeServices = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    if (activeServices.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-16 bg-white border-t border-beige-dark/10">
            <div className="max-w-4xl mx-auto px-6 md:px-8">

                <div className="text-center mb-10">
                    <span className="text-sage font-semibold tracking-widest uppercase text-sm">Cennik</span>
                    <h2 className="text-2xl md:text-3xl text-graphite font-serif mt-2">
                        Formy wsparcia
                    </h2>
                    <p className="mt-4 text-graphite/70 font-light max-w-2xl mx-auto text-sm md:text-base">
                        Zależy mi na pełnej transparentności. Poniżej znajdziesz informacje o czasie trwania i koszcie poszczególnych spotkań, abyś mógł/mogła spokojnie zapoznać się z nimi przed wyborem terminu.
                    </p>
                </div>
                <PricingList services={activeServices} />

            </div>
        </section>
    );
};
"use client";

import { useState } from "react";
import { Service } from "@prisma/client";

export const PricingList = ({ services }: { services: Service[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasMore = services.length > 3;
    const firstThree = services.slice(0, 3);
    const remainingServices = services.slice(3);

    const renderServiceCard = (service: Service) => (
        <div key={service.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 rounded-2xl bg-beige-light/30 border border-beige-dark/20 hover:border-sage/30 transition-colors">
            <div className="mb-2 sm:mb-0">
                <h3 className="text-lg font-medium text-graphite">{service.name}</h3>
                <p className="text-sm text-graphite/60 flex items-center gap-1.5 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Czas trwania: {service.duration} min
                </p>
            </div>
            <div className="text-xl md:text-2xl font-serif text-sage font-semibold">
                {service.price} zł
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-3">

            <div className="flex flex-col gap-3">{firstThree.map(renderServiceCard)}</div>

            {hasMore && (
                <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-0" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden flex flex-col gap-3">
                        {remainingServices.map(renderServiceCard)}
                    </div>
                </div>
            )}

            {hasMore && (<button onClick={() => setIsExpanded(!isExpanded)} className="mt-4 mx-auto flex items-center gap-2 text-sm font-medium text-graphite/60 hover:text-sage transition-colors px-4 py-2 rounded-lg hover:bg-beige-light/50">
                    {isExpanded ? (
                        <>
                            Zwiń listę usług
                            <svg className="w-4 h-4 transition-transform duration-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </>
                    ) : (
                        <>
                            Pokaż pozostałe usługi ({remainingServices.length})
                            <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </>
                    )}
                </button>
            )}

        </div>
    );
};
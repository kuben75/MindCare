import prisma from "@/infrastructure/prisma";
import ReservationClient from "@/app/reservation/ReservationClient";

export default async function ReservationPage({searchParams}: {searchParams: Promise<{date?: string; time?: string}>}) {
    const resolvedParams = await searchParams;
    const {date, time} = resolvedParams;

    const services = await prisma.service.findMany({
       where: {isActive: true},
        orderBy: {price: 'asc'}
    });

    return (
        <main className="min-h-screen bg-[#faf9f7] pt-32 pb-24 relative overflow-hidden">
            <div className="absolute top-0 lef-1/2 -translate-x-1/2 w-[800px] h-[400px]"></div>
            <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-sage font-bold tracking-[0.2rem] uppercase text-xs">

                    </span>
                    <h1 className="text-4xl text-graphite font-serif mt-4 mb-4">
                        Dokończ rezerwację
                    </h1>
                    <p className="text-graphite/60"></p>
                </div>
                <ReservationClient services={services} initialDate={date} initialTime={time} />
            </div>
        </main>
    )

}
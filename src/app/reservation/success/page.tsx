import { redirect } from "next/navigation";
import prisma from "@/infrastructure/prisma";
import Link from "next/link";
import { POLISH_MONTHS } from "@/constants/calendar";
import PatientActions from "@/app/reservation/success/PatientActions";

export const dynamic = 'force-dynamic';

export default async function SuccessReservationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const resolvedParams = await searchParams;
    const token = resolvedParams.token;

    if (!token) {
        redirect("/");
    }

    const reservation = await prisma.reservation.findUnique({
        where: { magicToken: token },
        include: { service: true }
    });

    if (!reservation) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#faf9f7] px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-serif text-graphite mb-2">Nie znaleziono rezerwacji</h1>
                    <p className="text-graphite/60 mb-6">Link może być nieprawidłowy lub wizyta została usunięta z systemu.</p>
                    <Link href="/" className="text-sage font-medium hover:underline">Wróć na stronę główną</Link>
                </div>
            </main>
        );
    }

    const date = new Date(reservation.date);
    const formattedDate = `${date.getDate()} ${POLISH_MONTHS[date.getMonth()].toLowerCase()} ${date.getFullYear()}`;
    const formattedTime = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    const getHeading = () => {
        if (reservation.status === 'PENDING') return "Rezerwacja w toku";
        if (reservation.status === 'PAID') return "Wizyta potwierdzona";
        if (reservation.status === 'CANCELLED') return "Wizyta anulowana";
        if (reservation.status === 'COMPLETED') return "Wizyta zakończona";
        return "Szczegóły wizyty";
    };

    return (
        <main className="min-h-screen bg-[#faf9f7] pt-32 pb-24 relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sage/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="max-w-2xl w-full mx-auto px-4 md:px-8 relative z-10">

                {reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED' && (
                    <div className="mb-6 p-4 bg-sage/10 text-sage rounded-2xl text-center text-sm font-medium border border-sage/20 animate-fade-in">
                        Zapisz ten link! Służy on do zarządzania Twoją wizytą. Wyślemy Ci go również na e-mail.
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-beige-dark/20 p-8 md:p-12 text-center animate-fade-in">

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        reservation.status === 'CANCELLED' ? 'bg-red-50 text-red-400' : 'bg-sage/10 text-sage'
                    }`}>
                        {reservation.status === 'CANCELLED' ? (
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif text-graphite mb-4">{getHeading()}</h1>
                    <p className="text-graphite/70 mb-10 text-lg leading-relaxed">
                        Witaj, <span className="font-semibold text-graphite">{reservation.patientName.split(' ')[0]}</span>. Poniżej znajdują się szczegóły Twojego spotkania z Pauliną.
                    </p>

                    <div className="bg-beige-light/30 border border-beige-dark/20 rounded-2xl p-6 text-left mb-10 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-beige-dark/10 gap-2">
                            <span className="text-graphite/60 text-sm uppercase tracking-wider font-medium">Status</span>
                            <span className="font-semibold text-graphite text-right">
                                {reservation.status === 'PENDING' && <span className="text-amber-600 flex items-center gap-2 justify-end"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>Oczekuje na płatność</span>}
                                {reservation.status === 'PAID' && <span className="text-sage flex items-center gap-1 justify-end"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Opłacona</span>}
                                {reservation.status === 'CANCELLED' && <span className="text-red-500">Anulowana</span>}
                                {reservation.status === 'COMPLETED' && <span className="text-blue-500">Zakończona</span>}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-beige-dark/10 gap-2">
                            <span className="text-graphite/60 text-sm uppercase tracking-wider font-medium">Usługa</span>
                            <span className="font-semibold text-graphite text-right">{reservation.service.name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-beige-dark/10 gap-2">
                            <span className="text-graphite/60 text-sm uppercase tracking-wider font-medium">Data i godzina</span>
                            <span className={`text-right font-bold ${reservation.status === 'CANCELLED' ? 'text-graphite/50 line-through' : 'text-sage'}`}>
                                {formattedDate}, godz. {formattedTime}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-2">
                            <span className="text-graphite/60 text-sm uppercase tracking-wider font-medium">Koszt</span>
                            <span className="font-semibold text-graphite text-right">{reservation.service.price} zł</span>
                        </div>
                    </div>

                    <PatientActions token={token} status={reservation.status} isRescheduleRequested={reservation.rescheduleRequested} reservationDate={reservation.date}/>

                    <div className="flex justify-center">
                        <Link href="/" className="text-sm text-graphite/50 hover:text-sage transition-colors flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Powrót do strony głównej
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
import PatientsClient from "@/app/admin/dashboard/patients/PatientsClient";
import InfoTooltip from "@/components/ui/InfoTooltip";
import {GetPatientsService} from "@/services/patients.service";

export const dynamic = 'force-dynamic';

export default async function PatientsPage() {
    const { patientList } = await GetPatientsService();

    return (
        <div className="space-y-8 md:space-y-10 animate-fade-in pb-12">
            <header className="max-w-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Zarządzanie pacjentami
                </p>
                <div className="flex items-center gap-2">
                <h1 className="text-3xl lg:text-4xl font-serif text-graphite dark:text-white tracking-wide leading-tight transition-colors">
                    Baza pacjentów
                </h1>
                <InfoTooltip
                    title="Automatyczny CRM"
                    description="Nie musisz dodawać pacjentów ręcznie. Każda nowa osoba rezerwująca wizytę przez stronę jest tu automatycznie dopisywana. Jeśli pacjent umówi się ponownie z tego samego adresu e-mail, system sam połączy jego historię wizyt."
                />
                </div>
                <p className="text-graphite/60 dark:text-zinc-400 text-sm mt-3 leading-relaxed">
                    Zarządzaj swoimi pacjentami, przeglądaj ich historię wizyt, notatki oraz statystyki.
                </p>
            </header>

            <PatientsClient patients={patientList}/>
        </div>
    );
}
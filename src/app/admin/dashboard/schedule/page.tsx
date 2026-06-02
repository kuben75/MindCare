import prisma from "@/infrastructure/prisma";
import ScheduleForm from "@/app/admin/dashboard/schedule/ScheduleForm";
import BlockedTimeManager from "@/app/admin/dashboard/schedule/BlockedTimeManager";

export const dynamic = 'force-dynamic';

export default async function AdminSchedulePage() {
    let schedules = await prisma.weeklySchedule.findMany({
        orderBy: {dayOfWeek: "asc"}
    });
    if(schedules.length === 0) {
        schedules = [
            { id: 'new-0', dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isActive: false },
            { id: 'new-1', dayOfWeek: 1, startTime: "17:00", endTime: "20:00", isActive: true },
            { id: 'new-2', dayOfWeek: 2, startTime: "17:00", endTime: "20:00", isActive: true },
            { id: 'new-3', dayOfWeek: 3, startTime: "17:00", endTime: "20:00", isActive: true },
            { id: 'new-4', dayOfWeek: 4, startTime: "17:00", endTime: "20:00", isActive: true },
            { id: 'new-5', dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isActive: true },
            { id: 'new-6', dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isActive: true },
        ];
    }
    const sortedSchedules = [...schedules].sort((a, b) => {
        const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek
        const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek
        return dayA - dayB;
    })
    return (
        <div className="p-6 lg:p-10 animate-fade-in text-graphite dark:text-zinc-100 transition-colors duration-300">
            <div className="mb-10 max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Ustawienia Grafiku
                </p>
                <h1 className="text-3xl font-serif tracking-wide mb-2 text-graphite dark:text-white transition-colors">
                    Grafik i Dostępność
                </h1>
                <p className="text-graphite/60 dark:text-zinc-400 text-sm transition-colors">
                    Ustaw swoje domyślne godziny pracy. Na podstawie tych ustawień system będzie generował wolne terminy
                    dla Twoich pacjentów w kalendarzu.
                </p>
            </div>
            <div className="max-w-4xl flex flex-col gap-8">
                <ScheduleForm initialSchedules={sortedSchedules}/>
                <BlockedTimeManager/>
            </div>

        </div>
    );
}
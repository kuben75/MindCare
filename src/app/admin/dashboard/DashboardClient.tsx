"use client";

import React from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {IDashboardData} from "@/types/dashboard";
import {containerVariants, itemVariants} from "@/framer-motion/animation-dashboard";
import {StatCard} from "@/app/admin/dashboard/components/StatCard";
import {ShortcutLink} from "@/app/admin/dashboard/components/ShortcutLink";
import {AlertBox} from "@/app/admin/dashboard/components/AlertBox";
import {AgendaCard} from "@/app/admin/dashboard/components/AgendaCard";
import {getPlural} from "@/utils/pluralize";


export default function DashboardClient({ data }: { data: IDashboardData }) {
    const todayFormatted = new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long', day: 'numeric', month: 'long'
    }).format(new Date());

    return (
        <motion.div
            className="space-y-10 pb-12 overflow-x-hidden px-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-serif text-graphite dark:text-gray-100 tracking-tight">
                        Dzień dobry, Paulina
                    </h1>
                    <p className="text-graphite/60 dark:text-gray-400 mt-2 text-sm font-medium">
                        <span className="capitalize">{todayFormatted}</span> • Masz zaplanowane <strong className="text-graphite dark:text-zinc-200">{data.todayVisitsCount}</strong> {getPlural(data.todayVisitsCount, ["spotkanie", "spotkania", "spotkań"])}.
                    </p>
                </div>
                <div className="shrink-0">
                    <Link href="/admin/dashboard/reservations" className="group px-6 py-3.5 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite rounded-2xl text-sm font-bold tracking-wide transition-all shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5">
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Nowa rezerwacja
                    </Link>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                    label="Dzisiaj" value={data.todayVisitsCount} subLabel={getPlural(data.todayVisitsCount, ["wizyta", "wizyty", "wizyt"])}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                />
                <StatCard
                    label="Jutro" value={data.tomorrowVisitsCount} subLabel={getPlural(data.tomorrowVisitsCount, ["wizyta", "wizyty", "wizyt"])}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                />
                <StatCard
                    label="Brak wpłaty" value={data.pendingVisitsCount} subLabel={getPlural(data.pendingVisitsCount, ["koszyk", "koszyki", "koszyków"])} isAlert={data.pendingVisitsCount > 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                />
                <StatCard
                    label="Katalog" value={data.activeServicesCount} subLabel={getPlural(data.activeServicesCount, ["usługa", "usługi", "usług"])}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-5">
                    <div className="flex justify-between items-center px-1 border-b border-beige-dark/20 dark:border-zinc-800 pb-3">
                        <h2 className="text-xl font-serif text-graphite dark:text-zinc-100 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-sage shadow-[0_0_10px_rgba(164,185,160,0.8)]"></span>
                            Agenda na dzisiaj
                        </h2>
                        <Link href="/admin/dashboard/reservations" className="text-sm font-semibold text-graphite/50 hover:text-sage dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                            Pełny kalendarz &rarr;
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {data.todaysAppointments.length === 0 ? (
                            <div className="p-16 text-center bg-beige-light/30 dark:bg-zinc-900/30 rounded-3xl border border-beige-dark/10 dark:border-zinc-800 border-dashed">
                                <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
                                    <svg className="w-10 h-10 text-sage/40 dark:text-emerald-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>
                                </div>
                                <h3 className="text-graphite dark:text-zinc-200 font-serif text-xl">Brak zaplanowanych spotkań</h3>
                                <p className="text-graphite/50 dark:text-zinc-500 text-sm mt-2 max-w-sm mx-auto">Masz dzisiaj luźniejszy dzień lub nikt się jeszcze nie zarezerwował w grafiku.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {data.todaysAppointments.map((appointment) => (
                                    <AgendaCard key={appointment.id} appointment={appointment} />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">

                    {data.rescheduleRequestsCount > 0 && (
                        <AlertBox count={data.rescheduleRequestsCount} />
                    )}

                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 mb-4 px-1">Szybkie akcje</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                            <ShortcutLink href="/admin/dashboard/schedule" label="Zarządzaj grafikiem" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
                            <ShortcutLink href="/admin/dashboard/waitlist" label="Lista rezerwowa" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>} />
                            <ShortcutLink href="/admin/dashboard/blog" label="Napisz artykuł" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>} />
                            <ShortcutLink href="/admin/dashboard/landing" label="Kreator strony głównej" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"/></svg>} />
                        </div>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
}
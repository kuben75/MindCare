"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IFinancesProps } from "@/types/finances";
import { formatPLN } from "@/utils/calendar-utils";
import { KpiCard } from "@/app/admin/dashboard/finances/section/KpiCard";
import { StatusBar } from "@/app/admin/dashboard/finances/section/StatusBar";
import { useFinanceClient } from "@/hooks/useFinanceClient";

export default function FinancesClient({
                                           totalRevenue,
                                           currentMonthRevenue,
                                           prevMonthRevenue,
                                           momDelta,
                                           completedCount,
                                           cancelledCount,
                                           pendingCount,
                                           paidCount,
                                           avgPerVisit,
                                           topServices,
                                           chartData,
                                           currentMonthTransactions,
                                       }: IFinancesProps) {
    const {
        hoveredBar,
        setHoveredBar,
        txSearch,
        setTxSearch,
        filteredTx,
        exportToCSV,
        maxRevenue,
        currentMonthName
    } = useFinanceClient({ chartData, currentMonthTransactions });

    return (
        <div className="space-y-8 md:space-y-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">

                <div className="max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                        Analiza finansowa
                    </p>
                    <h1 className="text-3xl lg:text-4xl font-serif text-graphite dark:text-white tracking-wide leading-tight">
                        Finanse i Raporty
                    </h1>
                    <p className="text-graphite/60 dark:text-zinc-400 text-sm mt-3 leading-relaxed">
                        Przychody gabinetu, podział na usługi i statystyki wizyt z ostatnich miesięcy.
                    </p>
                </div>

                <button
                    onClick={exportToCSV}
                    disabled={currentMonthTransactions.length === 0}
                    className="
                        group inline-flex items-center gap-2.5 px-5 py-3
                        bg-white dark:bg-zinc-800/80
                        border border-beige-dark/30 dark:border-zinc-700
                        text-graphite dark:text-zinc-200
                        rounded-2xl text-sm font-bold
                        hover:shadow-md hover:-translate-y-0.5
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                        transition-all duration-200 shrink-0
                        focus:outline-none focus:ring-2 focus:ring-sage/50
                    "
                    aria-label="Eksportuj transakcje do CSV"
                >
                    <svg className="w-4 h-4 text-sage dark:text-emerald-400 group-disabled:text-graphite/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l3-3m-3 3l-3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Eksportuj CSV
                    {currentMonthTransactions.length > 0 && (
                        <span className="px-2 py-0.5 bg-sage/10 dark:bg-emerald-900/30 text-sage dark:text-emerald-400 rounded-lg text-[10px] font-bold tabular-nums">
                            {currentMonthTransactions.length}
                        </span>
                    )}
                </button>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2 relative overflow-hidden bg-sage dark:bg-emerald-800 rounded-3xl p-6 lg:p-8 shadow-lg shadow-sage/20 dark:shadow-none transition-colors">

                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/10 pointer-events-none" aria-hidden="true" />
                    <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full border border-white/10 pointer-events-none" aria-hidden="true" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-4">
                            Przychód — {currentMonthName}
                        </h2>

                        <div className="flex items-end gap-4 flex-wrap mt-auto">
                            <p className="text-4xl lg:text-5xl font-serif text-white leading-none tabular-nums tracking-tight">
                                {formatPLN(currentMonthRevenue)}<span className="text-2xl ml-1 opacity-70 font-sans tracking-normal">zł</span>
                            </p>
                            {momDelta !== null && (
                                <div className={`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold mb-1
                                    ${momDelta >= 0 ? "bg-white/20 text-white" : "bg-black/20 text-white/90"}
                                `}>
                                    <svg className={`w-3 h-3 ${momDelta < 0 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7 7 7" />
                                    </svg>
                                    {momDelta >= 0 ? "+" : ""}{momDelta}% m/m
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                                <span className="text-xs font-medium text-white/80 tabular-nums">
                                    {currentMonthTransactions.length} transakcji
                                </span>
                            </div>
                            <span className="hidden sm:inline text-white/30">•</span>
                            <span className="text-xs font-medium text-white/60 tabular-nums">
                                Poprzedni: {formatPLN(prevMonthRevenue)} zł
                            </span>
                        </div>
                    </div>
                </div>

                <KpiCard
                    label="Całkowity przychód"
                    value={`${formatPLN(totalRevenue)} zł`}
                    sub="Suma opłaconych wizyt"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <KpiCard
                    label="Średnia kwota"
                    value={`${formatPLN(avgPerVisit)} zł`}
                    sub={`${completedCount + paidCount} opłaconych wizyt`}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <StatusBar label="Zakończone" count={completedCount} total={completedCount + cancelledCount + pendingCount + paidCount} color="emerald" />
                <StatusBar label="Opłacone" count={paidCount} total={completedCount + cancelledCount + pendingCount + paidCount} color="blue" />
                <StatusBar label="Anulowane" count={cancelledCount} total={completedCount + cancelledCount + pendingCount + paidCount} color="red" />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-[#262626] border border-beige-dark/20 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
                    <header className="flex items-center justify-between mb-8">
                        <h3 className="font-serif font-bold text-graphite dark:text-zinc-100 text-lg">
                            Przychody miesięczne
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">
                            Ostatnie 6 mies.
                        </span>
                    </header>

                    <div className="relative h-[240px] flex items-end gap-2 sm:gap-4 mt-auto">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7" aria-hidden="true">
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full border-t border-dashed border-beige-dark/20 dark:border-zinc-800" />
                            ))}
                        </div>

                        {chartData.map((data, index) => {
                            const hPct = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                            const isHovered = hoveredBar === index;
                            const isCurrentMonth = index === chartData.length - 1;

                            return (
                                <div
                                    key={index}
                                    className="relative flex flex-col items-center flex-1 h-full justify-end z-10 group cursor-crosshair"
                                    onMouseEnter={() => setHoveredBar(index)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                    onClick={() => setHoveredBar(hoveredBar === index ? null : index)}
                                >
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="absolute bottom-full mb-3 bg-graphite dark:bg-zinc-800 text-white text-[11px] font-bold py-2 px-3 rounded-xl whitespace-nowrap pointer-events-none shadow-xl border border-white/10 z-20"
                                            >
                                                {formatPLN(data.revenue)} zł
                                                <span className="text-white/50 font-medium ml-1.5">· {data.month}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${hPct}%` }}
                                        transition={{ duration: 0.7, delay: index * 0.05, ease: [0.25, 1, 0.5, 1] }}
                                        style={{ minHeight: data.revenue > 0 ? '4px' : '0px' }}
                                        className={`
                                            w-full rounded-t-xl transition-colors duration-300
                                            ${isCurrentMonth
                                            ? "bg-sage dark:bg-emerald-500 shadow-[0_-4px_20px_rgb(164,185,160,0.3)] dark:shadow-none"
                                            : isHovered
                                                ? "bg-graphite/40 dark:bg-zinc-500"
                                                : "bg-beige-dark/30 dark:bg-zinc-700"
                                        }
                                        `}
                                    />

                                    <span className={`
                                        mt-3 text-[10px] font-bold uppercase tracking-wider truncate w-full text-center transition-colors
                                        ${isCurrentMonth ? "text-sage dark:text-emerald-400" : "text-graphite/40 dark:text-zinc-500 group-hover:text-graphite/70 dark:group-hover:text-zinc-400"}
                                    `}>
                                        {data.month.split(" ")[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#262626] border border-beige-dark/20 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
                    <header className="flex items-center justify-between mb-7">
                        <h3 className="font-serif font-bold text-graphite dark:text-zinc-100 text-lg">
                            Top Usługi
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">
                            Wg przychodu
                        </span>
                    </header>

                    {topServices.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-graphite/30 dark:text-zinc-600 space-y-2">
                            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                            <span className="text-sm italic">Brak danych do analizy</span>
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1">
                            {topServices.map((service, index) => {
                                const pct = totalRevenue > 0 ? Math.round((service.revenue / totalRevenue) * 100) : 0;
                                const isTop = index === 0;

                                return (
                                    <div key={index} className={`space-y-2.5 transition-opacity ${index > 2 ? 'opacity-60 hover:opacity-100' : ''}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className={`text-[11px] font-bold tabular-nums w-4 shrink-0 flex justify-center ${isTop ? 'text-sage dark:text-emerald-400' : 'text-graphite/30 dark:text-zinc-600'}`}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-semibold text-graphite dark:text-zinc-200 truncate">
                                                    {service.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-graphite dark:text-zinc-100 tabular-nums shrink-0">
                                                {formatPLN(service.revenue)} zł
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-1.5 bg-beige-dark/15 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                    className={`h-full rounded-full ${isTop ? "bg-sage dark:bg-emerald-500" : "bg-graphite/30 dark:bg-zinc-500"}`}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 tabular-nums text-[10px]">
                                                <span className="font-bold text-graphite/50 dark:text-zinc-400 w-7 text-right">
                                                    {pct}%
                                                </span>
                                                <span className="font-medium text-graphite/30 dark:text-zinc-600">
                                                    · {service.count} wizyt
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white dark:bg-[#262626] border border-beige-dark/20 dark:border-zinc-700 rounded-3xl overflow-hidden shadow-sm">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-beige-dark/10 dark:border-zinc-800 bg-beige-light/20 dark:bg-zinc-800/30">
                    <div>
                        <h3 className="font-serif font-bold text-graphite dark:text-zinc-100 text-lg">
                            Ostatnie transakcje
                        </h3>
                        <p className="text-[11px] font-semibold text-graphite/50 dark:text-zinc-500 mt-1 uppercase tracking-widest">
                            {currentMonthName}
                        </p>
                    </div>

                    {currentMonthTransactions.length > 0 && (
                        <div className="relative sm:w-72">
                            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite/40 dark:text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Szukaj pacjenta lub usługi..."
                                value={txSearch}
                                onChange={e => setTxSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-beige-dark/30 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sage/40 focus:border-sage focus:outline-none dark:text-zinc-200 transition-all placeholder:text-graphite/30 dark:placeholder:text-zinc-600 shadow-sm"
                            />
                        </div>
                    )}
                </header>

                {currentMonthTransactions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 bg-beige-light/50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-5 rotate-3 shadow-sm border border-beige-dark/10 dark:border-zinc-700">
                            <svg className="w-8 h-8 text-graphite/30 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-graphite/70 dark:text-zinc-300">Brak transakcji</p>
                        <p className="text-sm text-graphite/40 dark:text-zinc-500 mt-1">W tym miesiącu nie opłacono jeszcze żadnej wizyty.</p>
                    </div>
                ) : (
                    <>

                        <div className="hidden md:grid md:grid-cols-[160px_minmax(0,1.5fr)_minmax(0,1.5fr)_100px_100px] gap-4 px-6 py-3.5 border-b border-beige-dark/10 dark:border-zinc-800 bg-white dark:bg-[#262626]">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">Data</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">Pacjent</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500">Usługa</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 text-right">Kwota</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-graphite/40 dark:text-zinc-500 text-right">Status</span>
                        </div>

                        <div className="divide-y divide-beige-dark/10 dark:divide-zinc-800/80">
                            <AnimatePresence mode="popLayout">
                                {filteredTx.map((tx) => {
                                    const dateObj = new Date(tx.date);
                                    const isPaid = tx.status === "Opłacona";

                                    return (
                                        <motion.div
                                            key={tx.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.2 }}
                                            className="group flex flex-col md:grid md:grid-cols-[160px_minmax(0,1.5fr)_minmax(0,1.5fr)_100px_100px] gap-y-3 md:gap-4 px-6 py-4 md:py-4 hover:bg-beige-light/30 dark:hover:bg-zinc-800/40 transition-colors items-center"
                                        >

                                            <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-beige-light dark:bg-zinc-800 flex flex-col items-center justify-center shrink-0 border border-beige-dark/10 dark:border-zinc-700/50">
                                                        <span className="text-[9px] font-bold text-graphite/40 dark:text-zinc-500 leading-none uppercase tracking-wider">
                                                            {dateObj.toLocaleString("pl-PL", { month: "short" }).replace(".", "")}
                                                        </span>
                                                        <span className="text-[15px] font-serif font-bold text-graphite dark:text-zinc-200 leading-none mt-0.5">
                                                            {dateObj.getDate()}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-mono font-medium text-graphite/50 dark:text-zinc-500">
                                                        {dateObj.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>

                                                <div className="md:hidden">
                                                    <StatusBadge isPaid={isPaid} status={tx.status} />
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center w-full md:w-auto min-w-0">
                                                <span className="text-[10px] uppercase font-bold text-graphite/40 dark:text-zinc-500 mb-1 md:hidden">Pacjent</span>
                                                <p className="text-sm font-semibold text-graphite dark:text-zinc-200 truncate w-full">
                                                    {tx.patientName}
                                                </p>
                                            </div>

                                            <div className="flex flex-col justify-center w-full md:w-auto min-w-0">
                                                <span className="text-[10px] uppercase font-bold text-graphite/40 dark:text-zinc-500 mb-1 md:hidden">Usługa</span>
                                                <p className="text-sm text-graphite/70 dark:text-zinc-400 truncate w-full">
                                                    {tx.serviceName}
                                                </p>
                                            </div>

                                            <div className="flex flex-col md:items-end justify-center w-full md:w-auto">
                                                <span className="text-[10px] uppercase font-bold text-graphite/40 dark:text-zinc-500 mb-1 md:hidden">Kwota</span>
                                                <p className="text-sm font-bold text-graphite dark:text-zinc-100 tabular-nums md:text-right w-full">
                                                    {formatPLN(tx.price)} zł
                                                </p>
                                            </div>

                                            <div className="hidden md:flex items-center justify-end w-full">
                                                <StatusBadge isPaid={isPaid} status={tx.status} />
                                            </div>

                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        <footer className="flex items-center justify-between px-6 py-4 border-t border-beige-dark/10 dark:border-zinc-800 bg-beige-light/30 dark:bg-zinc-800/20">
                            <span className="text-xs font-medium text-graphite/50 dark:text-zinc-500">
                                Pokazuję <strong className="text-graphite dark:text-zinc-300">{filteredTx.length}</strong> z {currentMonthTransactions.length}
                            </span>
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-graphite/40 dark:text-zinc-500 mr-2">Suma filtrowana</span>
                                <span className="text-base font-serif font-bold text-graphite dark:text-zinc-100 tabular-nums">
                                    {formatPLN(filteredTx.reduce((s, t) => s + t.price, 0))} zł
                                </span>
                            </div>
                        </footer>
                    </>
                )}
            </section>
        </div>
    );
}

function StatusBadge({ isPaid, status }: { isPaid: boolean, status: string }) {
    return (
        <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border
            ${isPaid
            ? "bg-emerald-50/50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-blue-50/50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
        }
        `}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500 dark:bg-emerald-400" : "bg-blue-500 dark:bg-blue-400"} animate-pulse`} />
            {status}
        </span>
    );
}
"use client";

import { useCalendarLogic } from "@/hooks/useCalendarLogic";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import DaysCarousel from "@/components/calendar/DaysCarousel";
import BookingBar from "@/components/calendar/BookingBar";
import WaitlistForm from "@/components/calendar/waitlist/WaitlistForm";


export const Calendar = () => {
    const {
        calendarData,
        selectedSlot,
        setSelectedSlot,
        headerDate,
        setHeaderDate,
        today,
        maxDate,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        services,
        carouselRef,
        handleMove,
        jumpToDate,
        handleScroll
    } = useCalendarLogic();



    return (
        <section id="kalendarz" className="w-full py-24 bg-beige-light border-t border-beige-dark/10 overflow-hidden relative transition-colors duration-500 dark:bg-[#1f1f1f] dark:border-zinc-800">
            <div className="absolute top-40 right-10 w-96 h-96 bg-sage/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-sage font-bold tracking-[0.2em] uppercase text-xs">Rozpocznij terapię</span>
                    <h2 className="text-4xl md:text-5xl text-graphite dark:text-zinc-100 font-serif mt-4 mb-8 leading-tight">Wybierz termin konsultacji</h2>

                    <div className="inline-flex bg-beige-light/50 dark:bg-zinc-800/50 border border-beige-dark/20 dark:border-zinc-700 p-1.5 rounded-2xl shadow-inner">
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:cursor-pointer ${
                                activeTab === 'calendar'
                                    ? 'bg-white dark:bg-zinc-700 text-sage dark:text-emerald-400 shadow-sm'
                                    : 'text-graphite/60 dark:text-zinc-400 hover:text-graphite dark:hover:text-zinc-200'
                            }`}
                        >
                            Dostępne terminy
                        </button>
                        <button
                            onClick={() => setActiveTab('waitlist')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:cursor-pointer ${
                                activeTab === 'waitlist'
                                    ? 'bg-white dark:bg-zinc-700 text-sage dark:text-emerald-400 shadow-sm'
                                    : 'text-graphite/60 dark:text-zinc-400 hover:text-graphite dark:hover:text-zinc-200'
                            }`}
                        >
                            Lista rezerwowa
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#262626] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-beige-dark/20 dark:border-zinc-700 overflow-hidden relative min-h-[500px]">

                    {activeTab === 'calendar' ? (
                        <div className="animate-fade-in flex flex-col h-full">
                            <CalendarHeader
                                startDate={headerDate}
                                today={today}
                                maxDate={maxDate}
                                handleMove={handleMove}
                                jumpToDate={jumpToDate}
                            />

                            {error ? (
                                <div className="w-full flex-1 min-h-[300px] flex flex-col items-center justify-center bg-[#faf9f7] dark:bg-[#262626] text-graphite px-4 text-center">
                                    <svg className="w-12 h-12 text-red-400/80 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    <p className="text-lg font-medium mb-2 dark:text-zinc-200">Ups, coś poszło nie tak</p>
                                    <p className="text-sm text-graphite/60 dark:text-zinc-400 max-w-sm">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-6 px-6 py-2.5 bg-sage hover:bg-opacity-90 text-white text-sm font-semibold rounded-xl hover:cursor-pointer transition-all shadow-md"
                                    >
                                        Spróbuj ponownie
                                    </button>
                                </div>
                            ) : isLoading ? (
                                <div className="w-full flex-1 min-h-[300px] flex flex-col items-center justify-center bg-[#faf9f7] dark:bg-[#262626] text-graphite/50 dark:text-zinc-500">
                                    <span className="animate-spin inline-block w-8 h-8 border-4 border-sage border-t-transparent rounded-full mb-4"></span>
                                    Wczytywanie kalendarza...
                                </div>
                            ) : (
                                <DaysCarousel
                                    calendarData={calendarData}
                                    selectedSlot={selectedSlot}
                                    setSelectedSlot={setSelectedSlot}
                                    today={today}
                                    carouselRef={carouselRef}
                                    onScroll={handleScroll}
                                />
                            )}

                            <BookingBar
                                selectedSlot={selectedSlot}
                            />
                        </div>
                    ) : (
                        <div className="p-8 md:p-12 max-w-2xl mx-auto animate-fade-in w-full h-full flex flex-col justify-center">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-sage/10 dark:bg-emerald-500/10 text-sage dark:text-emerald-400 rounded-full mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-2xl font-serif text-graphite dark:text-white mb-2">Brak pasującego terminu?</h3>
                                <p className="text-sm text-graphite/60 dark:text-zinc-400">
                                    Zapisz się na listę oczekujących. Jeśli wybrany termin niespodziewanie się zwolni, damy Ci znać jako pierwszej osobie!
                                </p>
                            </div>

                            <WaitlistForm services={services} />
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};
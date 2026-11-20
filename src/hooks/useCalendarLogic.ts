import {useState, useEffect, useRef} from "react";
import {DAYS_PER_VIEW_DESKTOP, DAYS_PER_VIEW_MOBILE, MAX_DAYS_AHEAD} from "@/constants/calendar";
import {IDaySchedule, TRawDaySchedule, TSelectedSlot} from "@/types/calendar";
import {Service} from "@prisma/client";
import {PATIENT_TZ, floatingFromKey, todayKeyIn} from "@/lib/time";

// The public calendar always shows Polish time (PATIENT_TZ), wherever the visitor is.
// Days are "floating" dates of the Polish calendar day, so local getters read the right day.
export const useCalendarLogic = () => {
    const todayKey = todayKeyIn(PATIENT_TZ);
    const today = floatingFromKey(todayKey);
    const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + MAX_DAYS_AHEAD);

    const [calendarData, setCalendarData] = useState<IDaySchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<TSelectedSlot | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'calendar' | 'waitlist'>('calendar');
    const [services, setServices] = useState<Service[]>([]);

    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(activeTab === 'waitlist' && services.length === 0) {
            fetch('/api/services')
                .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
                .then(data => { if (Array.isArray(data)) setServices(data); })
                .catch(() => console.error("Nie udało się wczytać usług"));
        }
    }, [activeTab, services.length]);

    const [headerDate, setHeaderDate] = useState(today);

    useEffect(() => {
        const fetchSlots = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/slots?startDate=${todayKey}`);
                const data = response.ok ? await response.json().catch(() => null) : null;
                if (!data || !Array.isArray(data.days)) {
                    setError("Nie udało się wczytać dostępnych terminów. Spróbuj ponownie za chwilę.");
                    return;
                }
                const parsedDays: IDaySchedule[] = data.days.map((day: TRawDaySchedule) => ({
                    ...day,
                    date: floatingFromKey(day.dateKey)
                }));
                setCalendarData(parsedDays);
            } catch{
                setError("Nie udało się wczytać dostępnych terminów. Sprawdź połączenie z internetem.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlots();
        // todayKey only changes at midnight; refetching then is not needed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMove = (direction: 1 | -1) => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth;
            carouselRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        }
    };

    const jumpToDate = (dateString: string) => {
        const newDate = floatingFromKey(dateString);

        const element = document.getElementById(`day-${newDate.getTime()}`);
        if (element && carouselRef.current) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            setHeaderDate(newDate);
        }
    };

    const handleScroll = () => {
        if (!carouselRef.current || calendarData.length === 0) return;

        const scrollLeft = carouselRef.current.scrollLeft;
        const isMobile = window.innerWidth < 768;
        const dayWidth = carouselRef.current.clientWidth / (isMobile ? DAYS_PER_VIEW_MOBILE : DAYS_PER_VIEW_DESKTOP);

        const visibleIndex = Math.round(scrollLeft / dayWidth);

        if (calendarData[visibleIndex]) {
            setHeaderDate(calendarData[visibleIndex].date);
        }
    };
    return {
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
    };
};
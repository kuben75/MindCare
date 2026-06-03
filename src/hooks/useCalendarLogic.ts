import {useState, useEffect, useRef} from "react";
import {DAYS_PER_VIEW_DESKTOP, DAYS_PER_VIEW_MOBILE, MAX_DAYS_AHEAD} from "@/constants/calendar";
import { IDaySchedule } from "@/types/calendar";
import {Service} from "@prisma/client";

export const useCalendarLogic = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

    const [calendarData, setCalendarData] = useState<IDaySchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<{date: Date, time: string} | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'calendar' | 'waitlist'>('calendar');
    const [services, setServices] = useState<Service[]>([]);

    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(activeTab === 'waitlist' && services.length === 0) {
            fetch('/api/services')
                .then(res => res.json())
                .then(data => setServices(data))
                .catch(err => console.error("Nie udało się wczytać usług:"));
        }
    }, [activeTab, services.length]);

    const [headerDate, setHeaderDate] = useState(today);

    useEffect(() => {
        const fetchSlots = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/slots?startDate=${today.toISOString()}`);
                if (response.ok) {
                    const data = await response.json();
                    const parsedDays: IDaySchedule[] = data.days.map((day: any) => ({
                        ...day,
                        date: new Date(day.date)
                    }));
                    setCalendarData(parsedDays);
                }
            } catch (error) {
                setError("Nie udało się wczytać dostępnych terminów. Sprawdź połączenie z internetem.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlots();
    }, []);

    const handleMove = (direction: 1 | -1) => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth;
            carouselRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        }
    };

    const jumpToDate = (dateString: string) => {
        const newDate = new Date(dateString);
        newDate.setHours(0, 0, 0, 0);

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
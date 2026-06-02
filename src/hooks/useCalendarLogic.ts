import { useState, useEffect } from "react";
import { MAX_DAYS_AHEAD } from "@/constants/calendar";
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
        services
    };
};
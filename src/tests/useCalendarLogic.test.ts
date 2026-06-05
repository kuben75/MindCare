import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCalendarLogic } from "@/hooks/useCalendarLogic";
import React from "react";

global.fetch = vi.fn();

Element.prototype.scrollIntoView = vi.fn();

describe('useCalendarLogic hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with correct default states and fetch slots on mount', async () => {
        const mockDays = [
            { date: new Date('2026-06-03T00:00:00.000Z').toISOString(), slots: [] }
        ];

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ days: mockDays })
        } as unknown as Response);

        const { result } = renderHook(() => useCalendarLogic());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.activeTab).toBe('calendar');
        expect(result.current.calendarData).toEqual([]);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/slots?startDate='));
        expect(result.current.calendarData).toHaveLength(1);
        expect(result.current.calendarData[0].date).toBeInstanceOf(Date);
    });

    it('should handle fetch errors gracefully', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useCalendarLogic());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Nie udało się wczytać dostępnych terminów. Sprawdź połączenie z internetem.");
        expect(result.current.calendarData).toEqual([]);
    });

    it('should fetch services when activeTab changes to waitlist', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ days: [] })
        } as unknown as Response);

        const { result } = renderHook(() => useCalendarLogic());

        const mockServices = [{ id: '1', name: 'Konsultacja' }];

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockServices
        } as unknown as Response);

        act(() => {
            result.current.setActiveTab('waitlist');
        });

        await waitFor(() => {
            expect(result.current.services).toHaveLength(1);
            expect(result.current.services[0].name).toBe('Konsultacja');
        });

        expect(fetch).toHaveBeenCalledWith('/api/services');
    });

    it('should handle carousel movement (handleMove)', () => {
        const { result } = renderHook(() => useCalendarLogic());

        const mockScrollBy = vi.fn();
        const mockRefElement = {
            clientWidth: 500,
            scrollBy: mockScrollBy
        } as unknown as HTMLDivElement;

        act(() => {
            (result.current.carouselRef as React.MutableRefObject<HTMLDivElement>).current = mockRefElement;
        });

        act(() => {
            result.current.handleMove(1);
        });

        expect(mockScrollBy).toHaveBeenCalledWith({ left: 500, behavior: 'smooth' });

        act(() => {
            result.current.handleMove(-1);
        });

        expect(mockScrollBy).toHaveBeenCalledWith({ left: -500, behavior: 'smooth' });
    });

    it('should jump to a specific date and update headerDate', () => {
        const { result } = renderHook(() => useCalendarLogic());

        const mockDateString = '2026-06-10T00:00:00.000Z';
        const expectedDate = new Date(mockDateString);
        expectedDate.setHours(0, 0, 0, 0);

        const mockElement = document.createElement('div');
        const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

        act(() => {
            (result.current.carouselRef as React.MutableRefObject<HTMLDivElement>).current = document.createElement('div');
        });

        act(() => {
            result.current.jumpToDate(mockDateString);
        });

        expect(getElementByIdSpy).toHaveBeenCalledWith(`day-${expectedDate.getTime()}`);
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        expect(result.current.headerDate.getTime()).toBe(expectedDate.getTime());

        getElementByIdSpy.mockRestore();
    });
});
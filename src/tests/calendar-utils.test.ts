import { describe, it, expect } from 'vitest';
import { getDateKey, formatDateTime, formatDateTimeAdmin } from '@/utils/calendar-utils';

describe('Calendar utils tests (calendar-utils.ts) ', () => {

    it('getDateKey - should correctly generate a date key in the format YYYY-MM-DD', () => {
        const testDate = new Date(2026, 4, 15);
        const result = getDateKey(testDate);

        expect(result).toBe('2026-05-15');
    });

    it('getDateKey - should correctly add leading zeros for single-digit days and months', () => {
        const testDate = new Date(2026, 0, 5);
        const result = getDateKey(testDate);

        expect(result).toBe('2026-01-05');
    });

    it('formatDateTime - patient view is Polish time with a grammatical month name', () => {
        const instant = new Date('2026-11-12T13:30:00Z'); // 14:30 in Warsaw (CET)
        const result = formatDateTime(instant);

        expect(result.formattedDate).toBe('12 listopada 2026');
        expect(result.formattedTime).toBe('14:30');
    });

    it('formatDateTimeAdmin - clinic view is London time (one hour behind Poland)', () => {
        const winter = new Date('2026-11-12T13:30:00Z');
        const summer = new Date('2026-06-12T13:30:00Z');

        expect(formatDateTimeAdmin(winter).formattedTime).toBe('13:30'); // GMT
        expect(formatDateTime(winter).formattedTime).toBe('14:30');      // CET
        expect(formatDateTimeAdmin(summer).formattedTime).toBe('14:30'); // BST
        expect(formatDateTime(summer).formattedTime).toBe('15:30');      // CEST
    });
});
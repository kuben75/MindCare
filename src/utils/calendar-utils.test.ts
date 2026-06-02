import { describe, it, expect } from 'vitest';
import { getDateKey, formatDateTime } from '@/utils/calendar-utils';

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

    it('formatDateTime - should return a formatted date and time', () => {
        const testDate = new Date(2026, 10, 12, 14, 30);
        const result = formatDateTime(testDate);

        expect(result).toHaveProperty('formattedDate');
        expect(result).toHaveProperty('formattedTime');

        expect(result.formattedDate).toBe('12 listopad 2026');
        expect(result.formattedTime).toBe('14:30');
    });
});
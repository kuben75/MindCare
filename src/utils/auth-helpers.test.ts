import { describe, it, expect } from 'vitest';
import { generateRecoveryCodes, getFifteenMinutesAgo, parseUserAgent } from './auth-helpers';

describe('Security Functions (auth-helpers.ts)', () => {

    it('getFifteenMinutesAgo - should correctly subtract 15 minutes from the current time', () => {
        const codes = generateRecoveryCodes();

        expect(codes).toHaveLength(10);

        codes.forEach(code => {
            expect(code).toMatch(/^[0-9a-f]{4}-[0-9a-f]{4}$/);
        });
    });

    it('parseUserAgent - should correctly identify known devices', () => {
        const now = Date.now();
        const fifteenMinsAgo = getFifteenMinutesAgo().getTime();

        const differenceInMinutes = Math.round((now - fifteenMinsAgo) / 1000 / 60);
        expect(differenceInMinutes).toBe(15);
    });

    it('parseUserAgent - should handle unknown devices correctly (edge case)', () => {
        const windowsChrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
        expect(parseUserAgent(windowsChrome)).toBe('Windows - Chrome');

        const macSafari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15';
        expect(parseUserAgent(macSafari)).toBe('Mac OS - Safari');
    });

    it('parseUserAgent - powinien obsługiwać nieznane urządzenia (Edge Case)', () => {
        const smartFridge = 'LodowkaSamsung/1.0 (Internet of Things)';
        expect(parseUserAgent(smartFridge)).toBe('Nieznany system - Nieznana przeglądarka');
    });
});
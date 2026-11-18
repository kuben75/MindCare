import { describe, expect, it } from "vitest";
import { buildWarsawDateObj, getWarsawStartOfDay } from "@/utils/warsaw-time";

describe("warsaw-time", () => {
    it("reads a date-only value as a Warsaw calendar day, then stores UTC", () => {
        const summer = buildWarsawDateObj("2026-06-03", "14:00");
        const winter = buildWarsawDateObj("2026-01-15", "14:00");

        expect(summer.toISOString()).toBe("2026-06-03T12:00:00.000Z");
        expect(winter.toISOString()).toBe("2026-01-15T13:00:00.000Z");
    });

    it("keeps an offset instant on its Warsaw calendar day before applying the wall time", () => {
        const fromUtcMidnightShift = buildWarsawDateObj("2026-06-02T22:00:00.000Z", "14:00");

        expect(fromUtcMidnightShift.toISOString()).toBe("2026-06-03T12:00:00.000Z");
        expect(getWarsawStartOfDay("2026-06-02T22:00:00.000Z").toUTC().toISO()).toBe("2026-06-02T22:00:00.000Z");
    });

    it("treats a wall time without an offset as Warsaw, including across DST", () => {
        expect(getWarsawStartOfDay("2026-06-03").toUTC().toISO()).toBe("2026-06-02T22:00:00.000Z");
        expect(getWarsawStartOfDay("2026-01-15").toUTC().toISO()).toBe("2026-01-14T23:00:00.000Z");
        expect(buildWarsawDateObj("2026-06-03T14:00:00", "14:00").toISOString()).toBe("2026-06-03T12:00:00.000Z");
    });
});

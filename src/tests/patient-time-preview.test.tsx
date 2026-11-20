import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { businessTimeToPatient, nextBusinessDateForWeekday } from "@/lib/time";
import { PatientTimePreview } from "@/components/ui/PatientTimePreview";

describe("business → patient time", () => {
    it("adds one hour (London → Warsaw) in winter and summer", () => {
        expect(businessTimeToPatient("2026-11-23", "17:00")).toEqual({ time: "18:00", dayShift: 0 });
        expect(businessTimeToPatient("2026-06-22", "17:00")).toEqual({ time: "18:00", dayShift: 0 });
    });

    it("flags when the patient's day is different", () => {
        expect(businessTimeToPatient("2026-11-23", "23:30")).toEqual({ time: "00:30", dayShift: 1 });
    });

    it("finds the next date for a weekday in London", () => {
        const friday = new Date("2026-11-20T12:00:00Z"); // Friday
        expect(nextBusinessDateForWeekday(5, friday)).toBe("2026-11-20");
        expect(nextBusinessDateForWeekday(1, friday)).toBe("2026-11-23");
        expect(nextBusinessDateForWeekday(0, friday)).toBe("2026-11-22");
    });
});

describe("PatientTimePreview", () => {
    it("shows the Polish range and the bookable slots", () => {
        const { container } = render(<PatientTimePreview dateKey="2026-11-23" startTime="17:00" endTime="20:00" showSlots />);
        const text = container.textContent || "";
        expect(text).toContain("Pacjenci w Polsce zobaczą:");
        expect(text).toContain("18:00–21:00");
        expect(text).toContain("18:00, 19:00, 20:00");
    });

    it("warns about an inverted or too short range", () => {
        expect(render(<PatientTimePreview dateKey="2026-11-23" startTime="20:00" endTime="17:00" />).container.textContent)
            .toMatch(/musi być późniejsza/);
        expect(render(<PatientTimePreview dateKey="2026-11-23" startTime="17:00" endTime="17:30" showSlots />).container.textContent)
            .toMatch(/nie zmieści się żadna wizyta/);
    });
});

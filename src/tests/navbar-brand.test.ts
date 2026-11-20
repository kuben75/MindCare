import { describe, it, expect, vi } from "vitest";

vi.mock("@/hooks/useNavbar", () => ({ useNavbar: vi.fn() }));

import { splitBrandName } from "@/components/layout/Navbar";

describe("splitBrandName", () => {
    it("splits a long clinic name into title + tagline", () => {
        expect(splitBrandName("Psychologia Odbicia Konsultacje psychologiczne"))
            .toEqual(["Psychologia Odbicia", "Konsultacje psychologiczne"]);
    });

    it("keeps short names on one line", () => {
        expect(splitBrandName("Paulina Kawka-Mirek")).toEqual(["Paulina Kawka-Mirek", null]);
        expect(splitBrandName("  Gabinet  ")).toEqual(["Gabinet", null]);
    });
});

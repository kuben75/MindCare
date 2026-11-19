import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { heroTemplateSchema } from "@/schemas/hero";

vi.mock("@/context/SettingsContext", () => ({ useSettings: () => null }));
vi.mock("next/image", () => ({
    // eslint-disable-next-line @next/next/no-img-element
    default: (props: Record<string, unknown>) => <img src={String(props.src)} alt={String(props.alt)} />,
}));

import { HeroPreview } from "@/components/layout/HeroPreview";

const base = {
    subtitle: "Podtytuł",
    imageUrl: "/photo-horizontal.jpg",
    layout: "TEXT_LEFT" as const,
    imageStyle: "HORIZONTAL" as const,
};

describe("HeroPreview title rendering", () => {
    it("renders HTML in the title as text, not markup", () => {
        const { container } = render(
            <HeroPreview {...base} title={'<img src=x onerror="alert(1)">'} />
        );
        const h1 = container.querySelector("h1")!;
        expect(h1.querySelector("img")).toBeNull();
        expect(h1.textContent).toContain("<img src=x onerror=");
    });

    it("keeps *emphasis* and line breaks", () => {
        const { container } = render(
            <HeroPreview {...base} title={"Prawdziwa zmiana\nzaczyna się od\n*zrozumienia*"} />
        );
        const h1 = container.querySelector("h1")!;
        expect(h1.querySelectorAll("br")).toHaveLength(2);
        expect(h1.querySelector("span.text-sage")?.textContent).toBe("zrozumienia");
    });
});

describe("heroTemplateSchema", () => {
    const valid = { title: "Tytuł", subtitle: "Pod" };

    it.each(["/#o-mnie", "#kalendarz", "https://example.com/x"])("accepts link %s", (link) => {
        expect(heroTemplateSchema.safeParse({ ...valid, primaryButtonLink: link }).success).toBe(true);
    });

    it.each(["javascript:alert(1)", "//evil.com", "data:text/html,x"])("rejects link %s", (link) => {
        expect(heroTemplateSchema.safeParse({ ...valid, primaryButtonLink: link }).success).toBe(false);
    });

    it("rejects unknown layout values", () => {
        expect(heroTemplateSchema.safeParse({ ...valid, layout: "EVIL" }).success).toBe(false);
    });
});

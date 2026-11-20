import { describe, it, expect, vi } from "vitest";

vi.mock("@/infrastructure/resend", () => ({ getResend: () => ({ emails: { send: vi.fn() } }) }));
vi.mock("@/infrastructure/prisma", () => ({ default: { clinicSettings: { findUnique: vi.fn() }, systemLog: { create: vi.fn() } } }));

import { resolveSender, SENDER_DOMAIN } from "@/utils/email-sender";

describe("sender address", () => {
    const fallback = `Gabinet <kontakt@${SENDER_DOMAIN}>`;

    it("keeps a configured sender on the verified domain", () => {
        expect(resolveSender(`Gabinet <hello@${SENDER_DOMAIN}>`, fallback)).toBe(`Gabinet <hello@${SENDER_DOMAIN}>`);
        expect(resolveSender(`hello@${SENDER_DOMAIN}`, fallback)).toBe(`hello@${SENDER_DOMAIN}`);
    });

    it("ignores senders Resend would reject (e.g. onboarding@resend.dev)", () => {
        expect(resolveSender("Gabinet <onboarding@resend.dev>", fallback)).toBe(fallback);
        expect(resolveSender("someone@gmail.com", fallback)).toBe(fallback);
        expect(resolveSender(undefined, fallback)).toBe(fallback);
        expect(resolveSender("  ", fallback)).toBe(fallback);
    });
});

describe("database TLS", () => {
    it("uses TLS for remote databases only", async () => {
        const { shouldUseSsl } = await vi.importActual<typeof import("@/infrastructure/prisma")>("@/infrastructure/prisma");
        expect(shouldUseSsl("postgresql://u:p@db.abc.supabase.co:5432/postgres")).toBe(true);
        expect(shouldUseSsl("postgresql://u:p@localhost:5432/db")).toBe(false);
        expect(shouldUseSsl("postgresql://u:p@db.example.com:5432/db?sslmode=disable")).toBe(false);
        expect(shouldUseSsl(undefined)).toBe(false);
    });
});

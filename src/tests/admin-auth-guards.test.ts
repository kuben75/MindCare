import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/requireAdmin";
import prisma from "@/infrastructure/prisma";
import proxy from "@/proxy";
import * as servicesRoute from "@/app/api/admin/services/route";
import * as serviceByIdRoute from "@/app/api/admin/services/[id]/route";
import * as settingsRoute from "@/app/api/admin/settings/route";
import * as uploadRoute from "@/app/api/admin/upload/route";
import * as waitlistByIdRoute from "@/app/api/admin/waitlist/[id]/route";

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }));
vi.mock("@/lib/requireAdmin", () => ({ requireAdmin: vi.fn() }));
vi.mock("@vercel/blob", () => ({ put: vi.fn() }));
vi.mock("@/infrastructure/prisma", () => ({
    default: {
        service: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
        reservation: { count: vi.fn() },
        clinicSettings: { upsert: vi.fn(), update: vi.fn() },
        waitlist: { delete: vi.fn() },
        systemLog: { create: vi.fn() },
    },
}));

const params = { params: Promise.resolve({ id: "x" }) };
const jsonReq = (body: unknown) =>
    new Request("http://localhost/api/admin", { method: "POST", body: JSON.stringify(body) });

describe("proxy", () => {
    beforeEach(() => vi.clearAllMocks());

    const call = (path: string) => proxy(new NextRequest(`http://localhost${path}`));

    it("rejects a revoked token on /api/admin", async () => {
        vi.mocked(getToken).mockResolvedValue({ revoked: true } as never);
        const res = await call("/api/admin/settings");
        expect(res.status).toBe(401);
    });

    it("rejects a token without sessionId", async () => {
        vi.mocked(getToken).mockResolvedValue({ email: "a@b.c" } as never);
        expect((await call("/api/admin/settings")).status).toBe(401);
    });

    it("rejects when getToken throws (malformed cookie/header)", async () => {
        vi.mocked(getToken).mockRejectedValue(new Error("bad token"));
        expect((await call("/api/admin/settings")).status).toBe(401);
    });

    it("redirects a revoked token away from the dashboard", async () => {
        vi.mocked(getToken).mockResolvedValue({ revoked: true } as never);
        const res = await call("/admin/dashboard");
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("/admin/login");
    });

    it("lets a live session through", async () => {
        vi.mocked(getToken).mockResolvedValue({ sessionId: "s1", revoked: false } as never);
        const res = await call("/api/admin/settings");
        expect(res.status).toBe(200);
    });
});

describe("admin routes reject requests when requireAdmin() resolves null", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(requireAdmin).mockResolvedValue(null);
    });

    const cases: [string, () => Promise<Response>][] = [
        ["GET /services", () => servicesRoute.GET()],
        ["POST /services", () => servicesRoute.POST(jsonReq({ name: "a", duration: 50, price: 1 }))],
        ["PATCH /services/[id]", () => serviceByIdRoute.PATCH(jsonReq({ name: "a" }), params)],
        ["DELETE /services/[id]", () => serviceByIdRoute.DELETE(jsonReq({}), params)],
        ["GET /settings", () => settingsRoute.GET()],
        ["PUT /settings", () => settingsRoute.PUT(jsonReq({ bankAccount: "PL00 attacker" }))],
        ["POST /upload", () => uploadRoute.POST(new Request("http://localhost", { method: "POST", body: new FormData() }))],
        ["DELETE /waitlist/[id]", () => waitlistByIdRoute.DELETE(jsonReq({}), params)],
    ];

    it.each(cases)("%s → 401 and no DB writes", async (_name, run) => {
        const res = await run();
        expect(res.status).toBe(401);
        expect(prisma.clinicSettings.update).not.toHaveBeenCalled();
        expect(prisma.service.create).not.toHaveBeenCalled();
        expect(prisma.service.update).not.toHaveBeenCalled();
        expect(prisma.service.delete).not.toHaveBeenCalled();
        expect(prisma.waitlist.delete).not.toHaveBeenCalled();
    });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/admin/security/sessions/route";
import prisma from "@/infrastructure/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

vi.mock("@/lib/requireAdmin", () => ({
    requireAdmin: vi.fn(),
}));

vi.mock("@/infrastructure/prisma", () => ({
    default: {
        deviceSession: {
            findMany: vi.fn(),
            updateMany: vi.fn(),
        },
    },
}));

describe("Admin Device Sessions Security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("zwraca 401 przy unieważnionej sesji", async () => {
        vi.mocked(requireAdmin).mockResolvedValue(null);

        const resGet = await GET();
        expect(resGet.status).toBe(401);

        const reqPatch = new Request("http://localhost/api/admin/security/sessions", {
            method: "PATCH",
            body: JSON.stringify({ sessionId: "session-123" }),
        });
        const resPatch = await PATCH(reqPatch);
        expect(resPatch.status).toBe(401);
    });

    it("unieważnia wyłącznie sesję należącą do zalogowanego admina (ochrona przed IDOR)", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            email: "paulina@test.pl",
            sessionId: "current-session",
        });
        vi.mocked(prisma.deviceSession.updateMany).mockResolvedValue({ count: 0 });

        const req = new Request("http://localhost/api/admin/security/sessions", {
            method: "PATCH",
            body: JSON.stringify({ sessionId: "cudza-sesja" }),
        });

        const res = await PATCH(req);
        expect(res.status).toBe(404);
        expect(prisma.deviceSession.updateMany).toHaveBeenCalledWith({
            where: {
                id: "cudza-sesja",
                adminEmail: "paulina@test.pl",
            },
            data: { isValid: false },
        });
    });
});

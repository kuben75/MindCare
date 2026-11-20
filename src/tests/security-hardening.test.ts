import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generate, generateSecret } from "otplib";
import prisma from "@/infrastructure/prisma";
import { sendRescheduleRequestConfirmation } from "@/utils/email-sender";
import { requireAdmin } from "@/lib/requireAdmin";
import { POST as waitlistPost } from "@/app/api/waitlist/route";
import { POST as reschedulePost } from "@/app/api/patient/reservation/reschedule/route";
import { POST as cancelPost } from "@/app/api/patient/reservation/cancel/route";
import { POST as passwordPost } from "@/app/api/admin/security/password/route";
import { checkReservationRateLimit } from "@/lib/rate-limit";
import { getClientIp, isAuthorizedCron, parseMagicToken, verifyTurnstile } from "@/lib/request-security";
import { detectImageType } from "@/lib/image-type";
import {
    consumeRecoveryCode,
    decryptTotpSecret,
    encryptTotpSecret,
    findRecoveryCode,
    hashRecoveryCode,
    verifyAndConsumeTotp,
} from "@/lib/two-factor";

vi.mock("@/infrastructure/prisma", () => ({
    default: {
        reservation: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
        systemLog: { create: vi.fn(), count: vi.fn() },
        service: { findUnique: vi.fn() },
        waitlist: { findFirst: vi.fn(), create: vi.fn() },
        admin: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
        deviceSession: { updateMany: vi.fn() },
        clinicSettings: { findUnique: vi.fn() },
    },
}));
vi.mock("@/utils/email-sender", () => ({
    sendMagicLinkEmail: vi.fn(),
    sendNewReservationAdminAlert: vi.fn(),
    sendRescheduleRequestConfirmation: vi.fn(),
    sendAdminRescheduleAlert: vi.fn(),
    sendCancellationEmail: vi.fn(),
    getClinicNotificationEmail: vi.fn().mockResolvedValue("clinic@example.com"),
    getAdminNotificationEmail: vi.fn().mockResolvedValue("admin@example.com"),
}));
vi.mock("@/lib/requireAdmin", () => ({ requireAdmin: vi.fn() }));
vi.mock("bcryptjs", () => ({
    default: { compare: vi.fn().mockResolvedValue(true), hash: vi.fn().mockResolvedValue("hashed") },
}));

const TOKEN = "3f2b8c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f";
const post = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body), headers });

beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret-at-least-32-characters-long";
});

// ---------------------------------------------------------------- Waitlist
describe("Waitlist", () => {
    const valid = { patientName: "Anna Nowak", email: "Anna@X.pl", phone: "500 600 700", serviceId: "svc1" };

    beforeEach(() => {
        vi.mocked(prisma.systemLog.count).mockResolvedValue(0);
        vi.mocked(prisma.service.findUnique).mockResolvedValue({ isActive: true } as never);
    });

    it("returns the same response for new and already-registered e-mails", async () => {
        vi.mocked(prisma.waitlist.findFirst).mockResolvedValueOnce(null);
        const fresh = await waitlistPost(post(valid, { "x-forwarded-for": "1.1.1.1" }));
        vi.mocked(prisma.waitlist.findFirst).mockResolvedValueOnce({ id: "w1" } as never);
        const dup = await waitlistPost(post(valid, { "x-forwarded-for": "1.1.1.1" }));

        expect(fresh.status).toBe(201);
        expect(dup.status).toBe(201);
        expect(await fresh.json()).toEqual(await dup.json());
        expect(prisma.waitlist.create).toHaveBeenCalledOnce();
    });

    it("does not echo the stored record back", async () => {
        vi.mocked(prisma.waitlist.findFirst).mockResolvedValue(null);
        const body = await (await waitlistPost(post(valid))).json();
        expect(body).not.toHaveProperty("data");
    });

    it("rate limits per IP", async () => {
        vi.mocked(prisma.systemLog.count).mockResolvedValue(5);
        expect((await waitlistPost(post(valid, { "x-forwarded-for": "1.1.1.1" }))).status).toBe(429);
        expect(prisma.waitlist.create).not.toHaveBeenCalled();
    });

    it("rejects oversized names and inactive services", async () => {
        expect((await waitlistPost(post({ ...valid, patientName: "A".repeat(500) }))).status).toBe(400);
        vi.mocked(prisma.service.findUnique).mockResolvedValue({ isActive: false } as never);
        expect((await waitlistPost(post(valid))).status).toBe(400);
    });
});

// ---------------------------------------------------------------- Patient endpoints
describe("Patient endpoints", () => {
    it("reject non-string / malformed tokens before touching the DB", async () => {
        for (const token of [{ not: "" }, ["a"], "not-a-uuid", 123]) {
            expect((await cancelPost(post({ token }))).status).toBe(400);
        }
        expect(prisma.reservation.findUnique).not.toHaveBeenCalled();
    });

    it("reschedule sends e-mails only on the first request", async () => {
        vi.mocked(prisma.reservation.findUnique).mockResolvedValue({ id: "r1", status: "PAID", email: "p@x.pl", patientName: "Jan", date: new Date(Date.now() + 3 * 86400000) } as never);
        vi.mocked(prisma.reservation.updateMany).mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

        await reschedulePost(post({ token: TOKEN }));
        const second = await reschedulePost(post({ token: TOKEN }));

        expect(second.status).toBe(200);
        expect(sendRescheduleRequestConfirmation).toHaveBeenCalledOnce();
    });
});

// ---------------------------------------------------------------- Password change
describe("Password change", () => {
    beforeEach(() => {
        vi.mocked(requireAdmin).mockResolvedValue({ email: "admin@x.pl", sessionId: "current" });
        vi.mocked(prisma.admin.findUnique).mockResolvedValue({ email: "admin@x.pl", password: "old-hash" } as never);
        vi.mocked(prisma.systemLog.count).mockResolvedValue(0);
    });

    it("logs out all other device sessions", async () => {
        const res = await passwordPost(post({ currentPassword: "old", newPassword: "a-much-longer-pass", confirmPassword: "a-much-longer-pass" }));
        expect(res.status).toBe(200);
        expect(prisma.deviceSession.updateMany).toHaveBeenCalledWith({
            where: { adminEmail: "admin@x.pl", isValid: true, id: { not: "current" } },
            data: { isValid: false },
        });
    });

    it("rejects short passwords and blocks after repeated failures", async () => {
        expect((await passwordPost(post({ currentPassword: "old", newPassword: "short", confirmPassword: "short" }))).status).toBe(400);
        vi.mocked(prisma.systemLog.count).mockResolvedValue(5);
        expect((await passwordPost(post({ currentPassword: "old", newPassword: "a-much-longer-pass", confirmPassword: "a-much-longer-pass" }))).status).toBe(429);
    });
});

// ---------------------------------------------------------------- 2FA primitives
describe("two-factor helpers", () => {
    it("encrypts TOTP secrets and still reads legacy plaintext", () => {
        const enc = encryptTotpSecret("JBSWY3DPEHPK3PXP");
        expect(enc).not.toContain("JBSWY3DPEHPK3PXP");
        expect(decryptTotpSecret(enc)).toBe("JBSWY3DPEHPK3PXP");
        expect(decryptTotpSecret("JBSWY3DPEHPK3PXP")).toBe("JBSWY3DPEHPK3PXP");
    });

    it("matches hashed and legacy recovery codes, case-insensitively", () => {
        const stored = [hashRecoveryCode("abcd-1234"), "beef-0001"];
        expect(stored[0]).not.toContain("abcd");
        expect(findRecoveryCode(stored, " ABCD-1234 ")).toBe(0);
        expect(findRecoveryCode(stored, "beef-0001")).toBe(1);
        expect(findRecoveryCode(stored, "dead-0000")).toBe(-1);
    });

    it("consumes a recovery code with a conditional update (race-safe)", async () => {
        const raw = JSON.stringify([hashRecoveryCode("abcd-1234")]);
        vi.mocked(prisma.admin.updateMany).mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
        expect(await consumeRecoveryCode("a1", raw, "abcd-1234")).toBe(true);
        expect(vi.mocked(prisma.admin.updateMany).mock.calls[0][0]).toMatchObject({ where: { id: "a1", recoveryCodes: raw } });
        expect(await consumeRecoveryCode("a1", raw, "abcd-1234")).toBe(false); // lost the race
    });

    it("rejects a replayed TOTP code", async () => {
        const secret = generateSecret();
        const code = await generate({ secret });
        const admin = { id: "a1", twoFactorSecret: encryptTotpSecret(secret), lastTotpTimeStep: null as number | null };
        vi.mocked(prisma.admin.updateMany).mockResolvedValue({ count: 1 });

        expect(await verifyAndConsumeTotp(admin, code)).toBe(true);
        const savedStep = vi.mocked(prisma.admin.updateMany).mock.calls[0][0].data!.lastTotpTimeStep as number;

        expect(await verifyAndConsumeTotp({ ...admin, lastTotpTimeStep: savedStep }, code)).toBe(false);
    });
});

// ---------------------------------------------------------------- Request helpers
describe("request-security helpers", () => {
    afterEach(() => {
        delete process.env.TURNSTILE_SECRET_KEY;
        delete process.env.CRON_SECRET;
        vi.unstubAllGlobals();
    });

    it("extracts the first forwarded IP and falls back to unknown-ip", () => {
        expect(getClientIp(new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }))).toBe("9.9.9.9");
        expect(getClientIp({ "x-real-ip": "8.8.8.8" })).toBe("8.8.8.8");
        expect(getClientIp(new Headers())).toBe("unknown-ip");
    });

    it("validates magic tokens", () => {
        expect(parseMagicToken(TOKEN)).toBe(TOKEN);
        expect(parseMagicToken({ not: "" })).toBeNull();
        expect(parseMagicToken("x")).toBeNull();
    });

    it("authorizes cron only with the exact bearer secret", () => {
        process.env.CRON_SECRET = "s3cret";
        const req = (auth?: string) => new Request("http://x", { headers: auth ? { authorization: auth } : {} });
        expect(isAuthorizedCron(req("Bearer s3cret"))).toBe(true);
        expect(isAuthorizedCron(req("Bearer wrong!"))).toBe(false);
        expect(isAuthorizedCron(req())).toBe(false);
        delete process.env.CRON_SECRET;
        expect(isAuthorizedCron(req("Bearer undefined"))).toBe(false);
    });

    it("Turnstile: skipped without secret, enforced with one", async () => {
        expect(await verifyTurnstile(undefined)).toBe(true);
        process.env.TURNSTILE_SECRET_KEY = "sk";
        expect(await verifyTurnstile(undefined)).toBe(false);
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }));
        expect(await verifyTurnstile("tok", "1.2.3.4")).toBe(true);
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ success: false }) }));
        expect(await verifyTurnstile("tok")).toBe(false);
    });

    it("reservation rate limit no longer lets unknown IPs through unlimited", async () => {
        vi.mocked(prisma.systemLog.count).mockResolvedValue(1);
        const res = await checkReservationRateLimit("unknown-ip");
        expect(res.success).toBe(false);
        expect(vi.mocked(prisma.systemLog.count).mock.calls[0][0]!.where!.ipAddress).toBe("unknown-ip");
    });

    it("detects images by magic bytes, rejects HTML/SVG disguised as images", () => {
        expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))?.ext).toBe("jpg");
        expect(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.ext).toBe("png");
        expect(detectImageType(Buffer.from("GIF89a....")))?.toMatchObject({ ext: "gif" });
        expect(detectImageType(Buffer.from("RIFF\0\0\0\0WEBPVP8 ")))?.toMatchObject({ ext: "webp" });
        expect(detectImageType(Buffer.from("<html><script>alert(1)</script>"))).toBeNull();
        expect(detectImageType(Buffer.from("<svg onload=alert(1)>"))).toBeNull();
    });
});

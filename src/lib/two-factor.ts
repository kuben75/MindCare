import crypto from "crypto";
import { verify } from "otplib";
import prisma from "@/infrastructure/prisma";

/**
 * Key material for 2FA secrets at rest. Prefer a dedicated TWO_FACTOR_ENCRYPTION_KEY;
 * falls back to NEXTAUTH_SECRET. WARNING: changing the key makes stored TOTP secrets and
 * recovery codes unusable (2FA has to be re-enrolled), so rotate it deliberately.
 */
function baseKey(): Buffer {
    const material = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
    if (!material) {
        throw new Error("Brak TWO_FACTOR_ENCRYPTION_KEY / NEXTAUTH_SECRET – nie można obsłużyć 2FA.");
    }
    return Buffer.from(material, "utf8");
}

function deriveKey(purpose: string): Buffer {
    return Buffer.from(crypto.hkdfSync("sha256", baseKey(), Buffer.alloc(0), `mindcare-2fa:${purpose}`, 32));
}

const ENC_PREFIX = "enc:v1:";

export function encryptTotpSecret(secret: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey("totp-secret"), iv);
    const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return ENC_PREFIX + [iv, tag, ciphertext].map((b) => b.toString("base64url")).join(":");
}

/** Decrypts a stored secret; legacy plaintext values (pre-encryption) are returned unchanged. */
export function decryptTotpSecret(stored: string): string {
    if (!stored.startsWith(ENC_PREFIX)) return stored;
    const [iv, tag, ciphertext] = stored.slice(ENC_PREFIX.length).split(":").map((p) => Buffer.from(p, "base64url"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey("totp-secret"), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

const HASH_PREFIX = "h1:";

export function normalizeRecoveryCode(code: string): string {
    return code.trim().toLowerCase();
}

/** Keyed hash (HMAC) — the codes have only 32 bits of entropy, so a plain hash would be brute-forceable offline. */
export function hashRecoveryCode(code: string): string {
    return HASH_PREFIX + crypto.createHmac("sha256", deriveKey("recovery-codes")).update(normalizeRecoveryCode(code)).digest("hex");
}

export function parseStoredRecoveryCodes(raw: string | null | undefined): string[] {
    try {
        const parsed = JSON.parse(raw || "[]");
        return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string") : [];
    } catch {
        return [];
    }
}

/** Index of the stored entry matching the input (hashed or legacy plaintext), or -1. */
export function findRecoveryCode(stored: string[], input: string): number {
    const normalized = normalizeRecoveryCode(input);
    if (!normalized) return -1;
    const hashed = Buffer.from(hashRecoveryCode(normalized));
    return stored.findIndex((entry) => {
        if (entry.startsWith(HASH_PREFIX)) {
            const candidate = Buffer.from(entry);
            return candidate.length === hashed.length && crypto.timingSafeEqual(candidate, hashed);
        }
        return entry === normalized; // legacy plaintext entry
    });
}

/**
 * Atomically removes one recovery code. The conditional update (on the exact previous value)
 * makes two concurrent logins with the same code unable to both succeed.
 */
export async function consumeRecoveryCode(adminId: string, rawStored: string, input: string): Promise<boolean> {
    const stored = parseStoredRecoveryCodes(rawStored);
    const index = findRecoveryCode(stored, input);
    if (index === -1) return false;

    const remaining = stored.filter((_, i) => i !== index);
    const result = await prisma.admin.updateMany({
        where: { id: adminId, recoveryCodes: rawStored },
        data: { recoveryCodes: JSON.stringify(remaining) },
    });
    return result.count === 1;
}

type TotpAdmin = { id: string; twoFactorSecret: string | null; lastTotpTimeStep: number | null };

/**
 * Verifies a TOTP code and records its time step so the same code cannot be replayed.
 * The conditional update also prevents two parallel requests from both using one code.
 */
export async function verifyAndConsumeTotp(admin: TotpAdmin, code: string): Promise<boolean> {
    if (!admin.twoFactorSecret || !/^\d{6}$/.test(code.trim())) return false;

    const result = await verify({
        token: code.trim(),
        secret: decryptTotpSecret(admin.twoFactorSecret),
        ...(admin.lastTotpTimeStep != null ? { afterTimeStep: admin.lastTotpTimeStep } : {}),
    });

    if (!result.valid || !("timeStep" in result)) return false;

    const updated = await prisma.admin.updateMany({
        where: {
            id: admin.id,
            OR: [{ lastTotpTimeStep: null }, { lastTotpTimeStep: { lt: result.timeStep } }],
        },
        data: { lastTotpTimeStep: result.timeStep },
    });
    return updated.count === 1;
}

/** Number of logged failures of `action` for this admin within the last `windowMs`. */
export async function countRecentFailures(action: string, email: string, windowMs = 15 * 60 * 1000): Promise<number> {
    return prisma.systemLog.count({
        where: { action, details: email, createdAt: { gte: new Date(Date.now() - windowMs) } },
    });
}

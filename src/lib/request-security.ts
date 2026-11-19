import crypto from "crypto";

type HeaderSource = Headers | Record<string, string | string[] | undefined> | undefined;

function readHeader(headers: HeaderSource, name: string): string | undefined {
    if (!headers) return undefined;
    if (headers instanceof Headers) return headers.get(name) ?? undefined;
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
}

/**
 * Client IP for rate limiting / audit logs.
 * On Vercel `x-vercel-forwarded-for` / `x-forwarded-for` are set by the edge and cannot be
 * spoofed by the client. Behind other proxies make sure they overwrite X-Forwarded-For.
 * Returns "unknown-ip" when nothing is available — callers must treat that as a shared bucket.
 */
export function getClientIp(headers: HeaderSource): string {
    const raw =
        readHeader(headers, "x-vercel-forwarded-for") ||
        readHeader(headers, "x-forwarded-for") ||
        readHeader(headers, "x-real-ip");
    const ip = raw?.split(",")[0]?.trim();
    return ip ? ip.slice(0, 64) : "unknown-ip";
}

export function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

export function isAuthorizedCron(req: Request): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return false;
    return safeEqual(req.headers.get("authorization") || "", `Bearer ${cronSecret}`);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Magic tokens are Prisma `uuid()` values — reject anything else before touching the DB. */
export function parseMagicToken(value: unknown): string | null {
    return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

/**
 * Verifies a Cloudflare Turnstile token. When TURNSTILE_SECRET_KEY is not configured the check
 * is skipped (local dev); in production set both TURNSTILE_SECRET_KEY and
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY.
 */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return true;
    if (typeof token !== "string" || !token || token.length > 2048) return false;

    try {
        const body = new URLSearchParams({ secret, response: token });
        if (ip && ip !== "unknown-ip") body.set("remoteip", ip);

        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body,
            signal: AbortSignal.timeout(5000),
        });
        const data = (await res.json()) as { success?: boolean };
        return data.success === true;
    } catch {
        return false;
    }
}

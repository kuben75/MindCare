import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Lazily created Resend client. Creating it at import time threw "Missing API key" whenever
 * RESEND_API_KEY was absent (CI, local builds), which broke `next build` while collecting page data.
 * Returns null when no key is configured — callers skip sending in that case.
 */
export function getResend(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    if (!client) client = new Resend(apiKey);
    return client;
}

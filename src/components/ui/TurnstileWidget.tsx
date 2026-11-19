"use client";
import { useEffect, useRef } from "react";

type TurnstileApi = {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export const isTurnstileEnabled = Boolean(SITE_KEY);

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
    if (window.turnstile) return Promise.resolve();
    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = SCRIPT_SRC;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
                scriptPromise = null;
                reject(new Error("Turnstile failed to load"));
            };
            document.head.appendChild(script);
        });
    }
    return scriptPromise;
}

/**
 * Cloudflare Turnstile anti-bot challenge. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured.
 */
export const TurnstileWidget = ({ onToken }: { onToken: (token: string) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const onTokenRef = useRef(onToken);

    useEffect(() => {
        onTokenRef.current = onToken;
    }, [onToken]);

    useEffect(() => {
        if (!SITE_KEY || !containerRef.current) return;
        let widgetId: string | null = null;
        let cancelled = false;

        loadScript()
            .then(() => {
                if (cancelled || !containerRef.current || !window.turnstile) return;
                widgetId = window.turnstile.render(containerRef.current, {
                    sitekey: SITE_KEY,
                    language: "pl",
                    callback: (token: string) => onTokenRef.current(token),
                    "expired-callback": () => onTokenRef.current(""),
                    "error-callback": () => onTokenRef.current(""),
                });
            })
            .catch(() => onTokenRef.current(""));

        return () => {
            cancelled = true;
            if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
        };
    }, []);

    if (!SITE_KEY) return null;
    return <div ref={containerRef} className="flex justify-center min-h-[65px]" />;
};

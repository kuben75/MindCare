import type { NextConfig } from "next";

const blobStoreId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3]?.toLowerCase();
const blobHostname = blobStoreId
    ? `${blobStoreId}.public.blob.vercel-storage.com`
    : "*.public.blob.vercel-storage.com";

const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://${blobHostname}`,
    "font-src 'self' data:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://js.stripe.com https://challenges.cloudflare.com",
    `connect-src 'self' https://api.stripe.com https://${blobHostname} https://challenges.cloudflare.com`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: blobHostname,
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "Content-Security-Policy", value: contentSecurityPolicy },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
                ],
            },
            {
                source: "/reservation/:path*",
                headers: [
                    { key: "Referrer-Policy", value: "no-referrer" },
                    { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
                ],
            },
        ];
    },
};

export default nextConfig;
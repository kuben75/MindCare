import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const hasSecureToken = req.cookies.has("__Secure-next-auth.session-token");
    const cookieName = hasSecureToken
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: hasSecureToken,
        cookieName: cookieName,
    });

    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        console.log(`[AUTH PROXY] Ścieżka: ${pathname} | Zalogowany: ${Boolean(token)} | Ciasteczko: ${cookieName}`);
    }

    if (pathname.startsWith("/api/admin")) {
        if (!token) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        if (!token) {
            const loginUrl = new URL("/admin/login", req.url);
            loginUrl.searchParams.set("callbackUrl", req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/((?!login).*)",
        "/api/admin/:path*",
    ],
};
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/infrastructure/prisma";
import { getFifteenMinutesAgo, parseUserAgent } from "@/utils/auth-helpers";
import { getClientIp } from "@/lib/request-security";
import { consumeRecoveryCode, verifyAndConsumeTotp } from "@/lib/two-factor";
import { sendNewDeviceAlertEmail } from "@/utils/email-sender";

declare module "next-auth" {
    interface Session {
        sessionId?: string;
    }
    interface User {
        sessionId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sessionId?: string;
        revoked?: boolean;
    }
}

// Valid bcrypt hash (cost 12, matching real admin hashes) of a random throwaway value, so a login
// for a non-existent email costs the same time as a real one (no user enumeration by timing).
const DUMMY_HASH = process.env.DUMMY_HASH || "$2b$12$HtA9A5RD0ZDTfqspRLqbf.JPOKrG39saUwYC4.OiB4W5eUjaOT/yq";

// Per (email, IP) — stops a single source quickly.
const MAX_FAILED_PER_IP = 5;
// Per account regardless of IP — stops distributed brute force. Kept higher so a third party
// cannot trivially lock the owner out.
const MAX_FAILED_PER_ACCOUNT = 20;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Panel administratora",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Hasło", type: "password" },
                twoFactorCode: { label: "Kod 2FA", type: "text" }
            },
            async authorize(e, req) {
                if (!e?.email || !e?.password) {
                    throw new Error("Proszę podać email i hasło");
                }
                const email = e.email.trim().toLowerCase().slice(0, 254);
                const ipAddress = getClientIp(req?.headers);

                const [failedFromIp, failedForAccount] = await Promise.all([
                    prisma.systemLog.count({
                        where: {
                            action: "FAILED_LOGIN",
                            details: email,
                            ipAddress: ipAddress,
                            createdAt: { gte: getFifteenMinutesAgo() }
                        }
                    }),
                    prisma.systemLog.count({
                        where: {
                            action: "FAILED_LOGIN",
                            details: email,
                            createdAt: { gte: getFifteenMinutesAgo() }
                        }
                    })
                ]);

                if (failedFromIp >= MAX_FAILED_PER_IP || failedForAccount >= MAX_FAILED_PER_ACCOUNT) {
                    await prisma.systemLog.create({
                        data: {
                            action: "BLOCKED_LOGIN_ATTEMPT",
                            details: email,
                            ipAddress: ipAddress
                        }
                    });
                    throw new Error("Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za 15 minut.");
                }

                const admin = await prisma.admin.findUnique({
                    where: { email }
                });

                const isValidPassword = await bcrypt.compare(e.password, admin ? admin.password : DUMMY_HASH);

                if (!admin || !isValidPassword) {
                    await prisma.systemLog.create({
                        data: {
                            action: "FAILED_LOGIN",
                            details: email,
                            ipAddress: ipAddress
                        }
                    });
                    throw new Error("Nieprawidłowy adres e-mail lub hasło.");
                }

                if (admin.twoFactorEnabled) {
                    const code = e.twoFactorCode;

                    if (!code || code === "undefined" || code.trim() === "") {
                        throw new Error("2FA_REQUIRED");
                    }

                    const usedRecoveryCode = await consumeRecoveryCode(admin.id, admin.recoveryCodes, code);

                    if (usedRecoveryCode) {
                        await prisma.systemLog.create({
                            data: { action: "UZYTY_KOD_ZAPASOWY", details: email, ipAddress }
                        });
                    } else {
                        const isValid2FA = await verifyAndConsumeTotp(admin, code);

                        if (!isValid2FA) {
                            await prisma.systemLog.create({
                                data: {
                                    action: "FAILED_LOGIN",
                                    details: email,
                                    ipAddress: ipAddress
                                }
                            });
                            throw new Error("INVALID_2FA");
                        }
                    }
                }

                const userAgent = req?.headers?.['user-agent'] || "Nieznane urządzenie";
                const deviceInfo = parseUserAgent(userAgent);

                const pastSession = await prisma.deviceSession.findFirst({
                    where: {
                        adminEmail: email,
                        userAgent: userAgent
                    }
                });

                if (!pastSession) {
                    void sendNewDeviceAlertEmail({
                        adminEmail: email,
                        adminName: admin.email,
                        deviceInfo,
                        ipAddress
                    });
                    await prisma.systemLog.create({
                        data: {
                            action: "LOGOWANIE_NOWE_URZADZENIE",
                            details: `${email} (${deviceInfo})`,
                            ipAddress: ipAddress,
                        }
                    });
                }

                const newDeviceSession = await prisma.deviceSession.create({
                    data: {
                        adminEmail: email,
                        ipAddress,
                        userAgent,
                        deviceInfo
                    }
                });

                await prisma.systemLog.create({
                    data: {
                        action: "LOGIN_SUCCESS",
                        details: email,
                        ipAddress
                    }
                });

                return {
                    id: admin.id,
                    email: admin.email,
                    sessionId: newDeviceSession.id
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sessionId = user.sessionId;
                token.revoked = false;
            }

            if (token.sessionId) {
                const dbSession = await prisma.deviceSession.findUnique({
                    where: { id: token.sessionId },
                    select: { isValid: true }
                });

                if (!dbSession || !dbSession.isValid) {
                    return { revoked: true };
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.revoked || !token.sessionId) {
                return {} as any;
            }
            session.sessionId = token.sessionId;
            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60
    },
    pages: {
        signIn: '/admin/login',
    },
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
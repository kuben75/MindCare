import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/infrastructure/prisma";
import { verify } from "otplib";
import { getFifteenMinutesAgo, parseUserAgent } from "@/utils/auth-helpers";
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

const DUMMY_HASH = process.env.DUMMY_HASH;

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
                const email = e.email.trim().toLowerCase();
                const rawIp = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || "unknown-ip";
                const ipAddress = (Array.isArray(rawIp) ? rawIp[0] : rawIp).split(",")[0].trim();

                const failedAttempts = await prisma.systemLog.count({
                    where: {
                        action: "FAILED_LOGIN",
                        details: email,
                        ipAddress: ipAddress,
                        createdAt: {
                            gte: getFifteenMinutesAgo()
                        }
                    }
                });

                if (failedAttempts >= 5) {
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

                const passwordToCompare = admin ? admin.password : DUMMY_HASH;
                const isValidPassword = passwordToCompare
                                            ? await bcrypt.compare(e.password, passwordToCompare)
                                            : false;

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

                    const normalizedCode = code.trim().toLowerCase();
                    const recoveryCodes: string[] = JSON.parse(admin.recoveryCodes || "[]");
                    const isRecoveryCode = recoveryCodes.includes(normalizedCode);

                    if (isRecoveryCode) {
                        const unusedCodes = recoveryCodes.filter(c => c !== normalizedCode);
                        await prisma.admin.update({
                            where: { id: admin.id },
                            data: { recoveryCodes: JSON.stringify(unusedCodes) }
                        });

                        await prisma.systemLog.create({
                            data: { action: "UZYTY_KOD_ZAPASOWY", details: email, ipAddress }
                        });
                    } else {
                        const isValid2FA = await verify({
                            token: code.trim(),
                            secret: admin.twoFactorSecret!
                        });

                        if (!isValid2FA.valid) {
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
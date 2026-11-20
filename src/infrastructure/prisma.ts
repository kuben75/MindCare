import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * TLS for remote databases (Supabase), plain connection for local/CI Postgres, which usually
 * doesn't support SSL ("The server does not support SSL connections").
 */
export function shouldUseSsl(connectionString: string | undefined): boolean {
    if (!connectionString) return false;
    try {
        const url = new URL(connectionString);
        if (url.searchParams.get("sslmode") === "disable") return false;
        return !["localhost", "127.0.0.1", "::1", "postgres"].includes(url.hostname);
    } catch {
        return true;
    }
}

const createPrismaClient = () => {
    const connectionString = process.env.DATABASE_URL;

    const pool = new Pool({
        connectionString,
        max: 1,
        idleTimeoutMillis: 3000,
        connectionTimeoutMillis: 5000,
        ...(shouldUseSsl(connectionString) ? { ssl: { rejectUnauthorized: false } } : {}),
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

declare const globalThis: {
    prismaGlobal?: PrismaClient;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? createPrismaClient();

globalThis.prismaGlobal = prisma;

export default prisma;

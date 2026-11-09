import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
    const connectionString = process.env.DATABASE_URL;

    const pool = new Pool({
        connectionString,
        max: 1,
        idleTimeoutMillis: 3000,
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false },
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
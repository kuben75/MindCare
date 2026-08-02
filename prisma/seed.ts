import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";
import {Pool} from "pg";
import {PrismaPg} from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding db...");

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'TestoweHaslo123!';

    const existingAdmin = await prisma.admin.findUnique({
        where: {email: adminEmail}
    });
    if (existingAdmin) {
        return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

     await prisma.admin.create({
        data: {
            email: adminEmail,
            password: hashedPassword
        }
    });
}
main()
.catch((e) => {
    console.error(e instanceof Error ? e.message : "Nieznany błąd podczas seedowania bazy danych");
    process.exit(1);
})
.finally(async(): Promise<void> => {
    await prisma.$disconnect();
})
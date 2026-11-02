import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Rozpoczynam seedowanie bazy danych...");

    const adminEmail = (process.env.ADMIN_EMAIL || 'kontakt@paulinakawkamirek.pl').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'StartoweMindCare2026!';

    const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminEmail }
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.admin.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                twoFactorEnabled: false
            }
        });
        console.log(`✅ Utworzono konto admina: ${adminEmail}`);
        console.log(`🔑 Hasło startowe: ${adminPassword}`);
    } else {
        console.log(`ℹ️ Konto admina (${adminEmail}) już istnieje, pomijam.`);
    }

    const existingSettings = await prisma.clinicSettings.findFirst();
    if (!existingSettings) {
        await prisma.clinicSettings.create({
            data: {
                clinicName: "Gabinet Psychoterapii Paulina Kawka-Mirek",
                nipNumber: "",
                bankAccount: "",
                email: adminEmail,
                phone: "+48 000 000 000"
            }
        });
        console.log("✅ Utworzono domyślne ustawienia gabinetu.");
    }

    const servicesCount = await prisma.service.count();
    if (servicesCount === 0) {
        await prisma.service.createMany({
            data: [
                {
                    name: "Konsultacja psychologiczna / psychoterapeutyczna",
                    duration: 50,
                    price: 200,
                    isActive: true,
                },
                {
                    name: "Sesja psychoterapii indywidualnej",
                    duration: 50,
                    price: 200,
                    isActive: true,
                }
            ]
        });
        console.log("✅ Dodano domyślne usługi do kalendarza.");
    }

    console.log("✨ Seedowanie zakończone sukcesem!");
}

main()
    .catch((e) => {
        console.error("❌ Błąd podczas seedowania bazy:", e instanceof Error ? e.message : e);
        process.exit(1);
    })
    .finally(async (): Promise<void> => {
        await prisma.$disconnect();
    });
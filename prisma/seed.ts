import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error(" Brak zmiennej środowiskowej DATABASE_URL.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Rozpoczynam seedowanie bazy danych...");

    const adminEmail = (process.env.ADMIN_EMAIL || "kontakt@paulinakawkamirek.pl").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 12) {
        throw new Error(
            " Brak bezpiecznego hasła startowego! Ustaw zmienną ADMIN_PASSWORD (min. 12 znaków) w pliku .env przed uruchomieniem seeda."
        );
    }

    const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await prisma.admin.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                twoFactorEnabled: false,
            },
        });
        console.log(` Utworzono konto admina: ${adminEmail}`);
    } else {
        console.log(`ℹ Konto admina (${adminEmail}) już istnieje, pomijam.`);
    }

    const existingSettings = await prisma.clinicSettings.findFirst();
    if (!existingSettings) {
        await prisma.clinicSettings.create({
            data: {
                id: "global",
                clinicName: "Psychologia Odbicia | Paulina Kawka-Mirek",
                nipNumber: "",
                bankAccount: "",
                email: adminEmail,
                phone: "",
            },
        });
        console.log(" Utworzono domyślne ustawienia gabinetu.");
    }

    const servicesCount = await prisma.service.count();
    if (servicesCount === 0) {
        await prisma.service.createMany({
            data: [
                {
                    name: "Konsultacja psychologiczna online",
                    duration: 50,
                    price: 200,
                    isActive: true,
                },
                {
                    name: "Wsparcie psychologiczne indywidualne online",
                    duration: 50,
                    price: 200,
                    isActive: true,
                },
            ],
        });
        console.log(" Dodano domyślne usługi do kalendarza.");
    }

    console.log(" Seedowanie zakończone sukcesem!");
}

main()
    .catch((e) => {
        console.error(" Błąd podczas seedowania bazy:", e instanceof Error ? e.message : e);
        process.exit(1);
    })
    .finally(async (): Promise<void> => {
        await prisma.$disconnect();
        await pool.end();
    });
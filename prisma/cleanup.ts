import {Pool} from "pg";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "@prisma/client";


const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.reservation.deleteMany();
    await prisma.waitlist.deleteMany();

    await prisma.service.deleteMany();
    await prisma.systemLog.deleteMany();
    await prisma.deviceSession.deleteMany();
    await prisma.blockedTime.deleteMany();
    await prisma.post.deleteMany();
    await prisma.heroTemplate.deleteMany();
    await prisma.weeklySchedule.deleteMany();
    await prisma.clinicSettings.deleteMany();
}

main()
    .catch((e) => {
        console.error(e instanceof Error ? e.message : "Nieznany błąd podczas czyszczenia bazy danych");
        process.exit(1);
    })
    .finally(async (): Promise<void> => {
        await prisma.$disconnect();
    });
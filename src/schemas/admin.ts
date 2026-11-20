import { z } from "zod";
import { isValidTime, timeToMinutes } from "@/lib/time";
import { isAllowedUrl } from "@/lib/sanitize-blog";

const time = z.string().refine(isValidTime, "Godzina musi mieć format GG:MM");

export const scheduleSchema = z.object({
    schedules: z.array(z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: time,
        endTime: time,
        isActive: z.boolean(),
    }))
        .length(7, "Grafik musi zawierać 7 dni")
        .refine((days) => new Set(days.map((d) => d.dayOfWeek)).size === 7, "Każdy dzień tygodnia może wystąpić tylko raz")
        .refine(
            (days) => days.every((d) => !d.isActive || (timeToMinutes(d.endTime)! > timeToMinutes(d.startTime)!)),
            "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia"
        ),
});

const serviceName = z.string().trim().min(2, "Nazwa usługi jest za krótka").max(120, "Nazwa usługi jest za długa");
const duration = z.coerce.number().int("Czas trwania musi być liczbą całkowitą").min(10, "Minimalny czas trwania to 10 minut").max(480, "Maksymalny czas trwania to 8 godzin");
const price = z.coerce.number().min(0, "Cena nie może być ujemna").max(100000, "Cena jest za wysoka");

export const serviceCreateSchema = z.object({ name: serviceName, duration, price });

export const serviceUpdateSchema = z.object({
    name: serviceName.optional(),
    duration: duration.optional(),
    price: price.optional(),
    isActive: z.boolean().optional(),
});

export const notesSchema = z.object({
    privateNotes: z.string().max(10000, "Notatka jest za długa").nullable(),
});

const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalUrl = z.string().trim().max(500)
    .refine((v) => v === "" || isAllowedUrl(v, false), "Link musi zaczynać się od http:// lub https://")
    .optional();

export const settingsSchema = z.object({
    clinicName: optionalText(150),
    email: z.string().trim().toLowerCase().max(254)
        .refine((v) => v === "" || z.email().safeParse(v).success, "Nieprawidłowy adres e-mail")
        .optional(),
    phone: optionalText(30),
    address: optionalText(300),
    bankAccount: optionalText(60),
    nipNumber: optionalText(20),
    instagramUrl: optionalUrl,
    facebookUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    znanyLekarzUrl: optionalUrl,
});

export const firstIssue = (error: z.ZodError, fallback = "Nieprawidłowe dane formularza") =>
    error.issues[0]?.message || fallback;

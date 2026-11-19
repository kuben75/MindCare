import {z} from "zod";

export const whitelistSchema = z.object({
    patientName: z.string()
        .trim()
        .min(2, "Podaj prawidłowe imię i nazwisko")
        .max(100, "Imię i nazwisko jest za długie")
        .regex(/^[\p{L}\s\-']+$/u, "Imię i nazwisko może zawierać tylko litery, myślniki i spacje"),
    email: z.string().trim().toLowerCase().max(254, "Adres email jest za długi").pipe(z.email("Podaj prawidłowy adres email")),
    phone: z.string()
        .transform(val => val.replace(/[\s\-]/g, ''))
        .refine(val => /^\+?[0-9]{9,15}$/.test(val), "Podaj prawidłowy numer telefonu"),
    serviceId: z.string().min(1, "Wybierz usługę").max(64),
    notes: z.string().trim().max(500, "Wiadomość jest za długa").optional(),
    turnstileToken: z.string().max(2048).optional(),
});

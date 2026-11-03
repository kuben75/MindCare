import { z } from "zod";

export const reservationSchema = z.object({
    patientName: z.string()
        .trim()
        .min(4, "Imię i nazwisko musi mieć minimum 4 znaki")
        .regex(/^[\p{L}\s\-']+$/u, "Imię i nazwisko może zawierać tylko litery, myślniki i spacje")
        .refine(val => val.trim().split(/\s+/).length >= 2, "Podaj imię i nazwisko (rozdzielone spacją)"),

    email: z.string().trim().toLowerCase().email("Podaj poprawny adres e-mail"),

    phone: z.string()
        .transform(val => val.replace(/[\s\-]/g, ''))
        .refine(val => /^\+?[0-9]{9,15}$/.test(val), "Nieprawidłowy format numeru telefonu"),

    serviceId: z.string().min(1, "Usługa jest wymagana"),

    date: z.string()
        .refine(val => !isNaN(Date.parse(val)), "Nieprawidłowy format daty")
        .transform(val => new Date(val))
        .refine(val => val.getTime() > Date.now() - 5 * 60 * 1000, "Nie można zarezerwować terminu z przeszłości"),

    termsAccepted: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin")
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
import { z } from "zod";

export const reservationSchema = z.object({
    patientName: z.string()
        .min(4, "Imię i nazwisko musi mieć minimum 4 znaki")
        .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-]+$/, "Podaj poprawne imię i nazwisko")
        .refine(val => val.trim().includes(' '), "Podaj imię i nazwisko (rozdzielone spacją)"),

    email: z.string().email("Podaj poprawny adres e-mail"),

    phone: z.string()
        .transform(val => val.replace(/[\s\-]/g, ''))
        .refine(val => /^\+?[0-9]{9,15}$/.test(val), "Nieprawidłowy format numeru telefonu"),

    serviceId: z.string().min(1, "Usługa jest wymagana"),

    date: z.string().transform(val => new Date(val)),
    termsAccepted: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin")
});


export type ReservationFormData = z.infer<typeof reservationSchema>;
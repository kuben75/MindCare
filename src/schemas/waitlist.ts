import {z} from "zod";

export const whitelistSchema = z.object({
    patientName: z.string().min(2, "Podaj prawidłowe imię i nazwisko"),
    email: z.email("Podaj prawidłowy adres email"),
    phone: z.string().min(9, "Podaj prawidłowy numer telefonu").max(15, "Podaj prawidłowy numer telefonu"),
    serviceId: z.string().min(1, "Wybierz usługę"),
    notes: z.string().max(500, "Wiadomość jest za długa").optional()
});
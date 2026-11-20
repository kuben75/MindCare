import { resend } from "@/infrastructure/resend";
import { realClinicPhone } from "@/constants/reservations";
import { render } from "@react-email/render";
import { formatDateTime, formatDateTimeAdmin } from "@/utils/calendar-utils";
import { ISendMagicLinkParams } from "@/types/email";

/** Admin e-mails show the clinic time (UK) and, next to it, what the patient sees (PL). */
function adminWhen(date: Date) {
    const admin = formatDateTimeAdmin(date);
    const patient = formatDateTime(date);
    return { ...admin, both: `${admin.formattedDate}, ${admin.formattedTime} (czas UK) / ${patient.formattedTime} (czas PL)` };
}
import prisma from "@/infrastructure/prisma";

import MagicLinkEmail from "@/emails/MagicLink";
import CancelAppointmentEmail from "@/emails/CancelAppointmentEmail";
import NewDeviceAlertEmail from "@/emails/NewDeviceAlertEmail";
import UniversalEmail from "@/emails/UniversalEmail";
import { Reservation, ReservationStatus } from "@prisma/client";

/**
 * Resend only delivers to other people when the sender is on a verified domain. Anything else
 * (e.g. the default onboarding@resend.dev) works solely for the account owner's own address.
 */
export const SENDER_DOMAIN = (process.env.EMAIL_DOMAIN || "psychologiaodbicia.com").toLowerCase();

export function resolveSender(configured: string | undefined, fallback: string): string {
    const value = configured?.trim();
    if (!value) return fallback;
    const address = (value.match(/<([^>]+)>/)?.[1] ?? value).trim().toLowerCase();
    if (address.endsWith(`@${SENDER_DOMAIN}`)) return value;
    console.warn(`[E-mail] EMAIL_FROM (${address}) nie należy do zweryfikowanej domeny ${SENDER_DOMAIN} — używam ${fallback}.`);
    return fallback;
}

const DEFAULT_FROM = resolveSender(process.env.EMAIL_FROM, `Psychologia Odbicia – Paulina Kawka-Mirek <kontakt@${SENDER_DOMAIN}>`);
const SYSTEM_FROM = resolveSender(process.env.EMAIL_FROM_SYSTEM ?? process.env.EMAIL_FROM, `Psychologia Odbicia – powiadomienia <powiadomienia@${SENDER_DOMAIN}>`);

/** Replies from patients go to the clinic's real inbox (ClinicSettings.email). */
async function clinicReplyTo(): Promise<string | undefined> {
    try {
        const settings = await prisma.clinicSettings.findUnique({ where: { id: "global" }, select: { email: true } });
        return settings?.email?.trim() || process.env.ADMIN_NOTIFICATION_EMAIL || undefined;
    } catch {
        return undefined;
    }
}

async function sendEmailBase(
    to: string,
    subject: string,
    reactComponent: React.ReactElement,
    from = DEFAULT_FROM
): Promise<boolean> {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_dummy")) {
        console.warn(`[Resend Warn] Brak poprawnego RESEND_API_KEY - pomijam wysyłkę maila: "${subject}" do: ${to}`);
        return false;
    }

    try {
        const html = await render(reactComponent);
        const replyTo = from === DEFAULT_FROM ? await clinicReplyTo() : undefined;
        const { error } = await resend.emails.send({ from, to, subject, html, ...(replyTo ? { replyTo } : {}) });

        if (error) {
            console.error(`[Resend API Error] Błąd wysyłania do ${to}:`, error);
            await prisma.systemLog.create({
                data: {
                    action: "BŁĄD_EMAIL",
                    details: `Resend odrzucił wysyłkę "${subject}" do ${to}: ${error.message}`
                }
            }).catch(() => {});
            return false;
        }

        return true;
    } catch (error) {
        console.error(`[Resend Exception] Wyjątek podczas wysyłania maila "${subject}" do ${to}:`, error);
        await prisma.systemLog.create({
            data: {
                action: "BŁĄD_EMAIL",
                details: `Błąd sieci/kodu przy wysyłce "${subject}" do ${to}: ${error instanceof Error ? error.message : String(error)}`
            }
        }).catch(() => {});
        return false;
    }
}

/** Phone / e-mail patients should use to arrange payment (from clinic settings). */
async function getClinicContact(): Promise<{ clinicPhone: string | null; clinicEmail: string | null }> {
    const settings = await prisma.clinicSettings.findUnique({ where: { id: "global" }, select: { phone: true, email: true } });
    return {
        clinicPhone: realClinicPhone(settings?.phone),
        clinicEmail: settings?.email?.trim() || null,
    };
}

/** Clinic contact address from settings, falling back to the admin notification address. */
export async function getClinicNotificationEmail(): Promise<string> {
    const settings = await prisma.clinicSettings.findUnique({ where: { id: "global" }, select: { email: true } });
    return settings?.email?.trim().toLowerCase() || getAdminNotificationEmail();
}

export async function getAdminNotificationEmail(): Promise<string> {
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        return process.env.ADMIN_NOTIFICATION_EMAIL.trim().toLowerCase();
    }
    const admin = await prisma.admin.findFirst({ select: { email: true } });
    if (admin?.email) return admin.email.trim().toLowerCase();

    const settings = await prisma.clinicSettings.findFirst({ select: { email: true } });
    if (settings?.email) return settings.email.trim().toLowerCase();

    return (process.env.ADMIN_EMAIL || "kontakt@paulinakawkamirek.pl").trim().toLowerCase();
}

export async function sendMagicLinkEmail({
                                             email, patientName, date, serviceName, magicToken, status, clinicPhone, clinicEmail, price
                                         }: ISendMagicLinkParams) {
    const { formattedDate, formattedTime } = formatDateTime(date);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const contact = status === "PENDING" && !clinicPhone && !clinicEmail
        ? await getClinicContact()
        : { clinicPhone, clinicEmail };

    return sendEmailBase(
        email,
        status === "PENDING"
            ? `Rezerwacja wstępna – skontaktuj się w sprawie płatności (${formattedDate})`
            : `Wizyta potwierdzona: ${formattedDate}`,
        MagicLinkEmail({
            patientName,
            date: formattedDate,
            time: formattedTime,
            serviceName,
            magicLink: `${baseUrl}/reservation/success?token=${magicToken}`,
            status,
            ...contact,
            price
        })
    );
}

export async function sendCancellationEmail({
                                                email, patientName, date, serviceName, reason
                                            }: {
    email: string; patientName: string; date: Date; serviceName: string; reason?: string
}) {
    const { formattedDate, formattedTime } = formatDateTime(date);

    return sendEmailBase(
        email,
        `Ważne: Odwołanie wizyty (${formattedDate})`,
        CancelAppointmentEmail({ patientName, date: formattedDate, time: formattedTime, serviceName, reason })
    );
}

export async function sendRescheduleEmail({
                                              email, patientName, date, serviceName, magicToken, status
                                          }: {
    email: string; patientName: string; date: Date; serviceName: string; magicToken?: string; status?: ReservationStatus
}) {
    const { formattedDate, formattedTime } = formatDateTime(date);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = magicToken ? `${baseUrl}/reservation/success?token=${magicToken}` : baseUrl;

    return sendEmailBase(
        email,
        `Nowy termin wizyty: ${formattedDate}`,
        MagicLinkEmail({
            patientName,
            date: formattedDate,
            time: formattedTime,
            serviceName,
            magicLink: link,
            status: status || "PENDING",
            ...(status === "PAID" || status === "COMPLETED" ? {} : await getClinicContact())
        })
    );
}

export async function sendNewDeviceAlertEmail({
                                                  adminEmail, adminName, deviceInfo, ipAddress
                                              }: {
    adminEmail: string; adminName: string; deviceInfo: string; ipAddress: string
}) {
    const { formattedDate, formattedTime } = formatDateTimeAdmin(new Date());

    return sendEmailBase(
        adminEmail,
        `Alert: Nowe logowanie na Twoje konto`,
        NewDeviceAlertEmail({ adminName, deviceInfo, ipAddress, time: `${formattedTime}, ${formattedDate}` }),
        SYSTEM_FROM
    );
}

export async function sendRescheduleRequestConfirmation({
                                                            email, patientName, date
                                                        }: {
    email: string; patientName: string; date: Date
}) {
    const { formattedDate } = formatDateTime(date);
    const firstName = patientName.split(' ')[0];

    return sendEmailBase(
        email,
        `Prośba o zmianę terminu wizyty`,
        UniversalEmail({
            title: "Prośba przyjęta",
            previewText: "Potwierdzenie zgłoszenia zmiany terminu",
            greeting: `Cześć ${firstName},`,
            message: `Otrzymałam Twoją prośbę o zmianę terminu wizyty zaplanowanej na ${formattedDate}.\n\nSkontaktuję się z Tobą wkrótce, abyśmy mogli wspólnie ustalić nową datę, która będzie Ci odpowiadać.`,
            actionLabel: "Przejdź na stronę główną",
            actionUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        })
    );
}

export async function sendFollowUpEmail({
                                            email, patientName, date, message
                                        }: {
    email: string; patientName: string; date: Date; message: string;
}) {
    const { formattedDate } = formatDateTime(date);
    const firstName = patientName.split(' ')[0] || patientName;

    return sendEmailBase(
        email,
        `Podsumowanie wizyty z dnia ${formattedDate}`,
        UniversalEmail({
            title: "Podsumowanie wizyty",
            previewText: "Dziękuję za wizytę - podsumowanie i dalsze kroki",
            greeting: `Cześć ${firstName}`,
            message: message,
            actionLabel: "Umów kolejną wizytę",
            actionUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        })
    );
}

export async function sendNewReservationAdminAlert({
                                                       adminEmail, patientName, patientEmail, patientPhone, date, serviceName, status
                                                   }: {
    adminEmail: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    date: Date;
    serviceName: string;
    status?: string;
}) {
    const { formattedDate, both } = adminWhen(date);
    const statusLabel = status === "PAID" ? "Opłacona" : "Oczekuje na płatność";

    return sendEmailBase(
        adminEmail,
        `Nowa rezerwacja: ${patientName} (${formattedDate})`,
        UniversalEmail({
            title: "Masz nową rezerwację!",
            previewText: `Nowy pacjent: ${patientName} zapisał się na ${formattedDate}`,
            greeting: `Cześć Paulina,`,
            message: `W Twoim kalendarzu pojawiła się nowa wizyta.\n\nSzczegóły spotkania:\n• Pacjent: ${patientName}\n• Email: ${patientEmail || 'brak'}\n• Telefon: ${patientPhone || 'brak'}\n• Usługa: ${serviceName}\n• Termin: ${both}\n• Status: ${statusLabel}\n\nZaloguj się do panelu, aby zarządzać wizytą i zweryfikować płatność.`,
            actionLabel: "Przejdź do kalendarza",
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard/calendar`
        }),
        SYSTEM_FROM
    );
}

export async function sendAdminRescheduleAlert({
                                                   adminEmail, patientName, date
                                               }: {
    adminEmail: string; patientName: string; date: Date
}) {
    const { both } = adminWhen(date);

    return sendEmailBase(
        adminEmail,
        `Prośba o zmianę terminu: ${patientName}`,
        UniversalEmail({
            title: "Prośba o zmianę terminu",
            previewText: `${patientName} prosi o zmianę daty wizyty.`,
            greeting: `Cześć,`,
            message: `Pacjent ${patientName} poprosił przed chwilą o zmianę terminu wizyty zaplanowanej na ${both}.\n\nSkontaktuj się z pacjentem, aby ustalić nowy termin i zaktualizować wizytę w kalendarzu.`,
            actionLabel: "Przejdź do panelu",
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard/calendar`
        }),
        SYSTEM_FROM
    );
}

export async function sendPatientReminderEmail({
                                                   email, patientName, date, serviceName
                                               }: {
    email: string; patientName: string; date: Date; serviceName: string
}) {
    const { formattedDate, formattedTime } = formatDateTime(date);
    const firstName = patientName.split(' ')[0];

    return sendEmailBase(
        email,
        `Przypomnienie o jutrzejszej wizycie (${formattedTime})`,
        UniversalEmail({
            title: "Przypomnienie o wizycie",
            previewText: "Jutro odbędzie się Twoja wizyta w gabinecie.",
            greeting: `Cześć ${firstName},`,
            message: `Przypominam o jutrzejszej wizycie w moim gabinecie:\n\nUsługa: ${serviceName}\nData: ${formattedDate}\nGodzina: ${formattedTime} (czas polski)\n\nJeśli nie będziesz w stanie dotrzeć, bardzo proszę o jak najszybszą informację (możesz po prostu odpisać na tego e-maila), abym mogła zaproponować ten termin komuś z listy rezerwowej.\n\nDo zobaczenia!`
        })
    );
}

export async function sendAdminDailyReportEmail({
                                                    adminEmail, appointmentsCount, firstAppointment, date
                                                }: {
    adminEmail: string; appointmentsCount: number; firstAppointment?: Reservation; date: Date
}) {
    const { formattedDate } = formatDateTimeAdmin(date);

    let message = `Masz dzisiaj zaplanowanych wizyt: ${appointmentsCount}.\n\n`;
    if (firstAppointment) {
        const { formattedTime } = formatDateTimeAdmin(firstAppointment.date);
        message += `Pierwszy pacjent: ${firstAppointment.patientName} o godzinie ${formattedTime} (czas UK).\n\n`;
    }
    message += `Miłego i spokojnego dnia!`;

    return sendEmailBase(
        adminEmail,
        `Twój plan dnia: ${formattedDate} (${appointmentsCount} wizyt)`,
        UniversalEmail({
            title: "Poranny raport",
            previewText: `Dzisiaj masz ${appointmentsCount} pacjentów.`,
            greeting: `Dzień dobry Paulina,`,
            message: message,
            actionLabel: "Otwórz kalendarz",
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard/calendar`
        }),
        SYSTEM_FROM
    );
}
/** Tells the clinic that a patient cancelled a visit themself (and whether a refund is due). */
export async function sendAdminCancellationAlert({
                                                     adminEmail, patientName, patientEmail, date, serviceName, refundDue, amount
                                                 }: {
    adminEmail: string; patientName: string; patientEmail: string; date: Date; serviceName: string; refundDue: boolean; amount?: number
}) {
    const { both } = adminWhen(date);
    const refundLine = refundDue
        ? `\n\nWizyta była opłacona i odwołano ją ponad 24h przed terminem — należy zwrócić pacjentowi ${amount ?? ""} zł.`
        : "";

    return sendEmailBase(
        adminEmail,
        `Odwołana wizyta: ${patientName}`,
        UniversalEmail({
            title: "Pacjent odwołał wizytę",
            previewText: `${patientName} odwołał(a) wizytę.`,
            greeting: "Cześć,",
            message: `Pacjent ${patientName} (${patientEmail}) odwołał wizytę „${serviceName}” zaplanowaną na ${both}. Termin jest już wolny w kalendarzu.${refundLine}`,
            actionLabel: "Przejdź do panelu",
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/dashboard/reservations`
        }),
        SYSTEM_FROM
    );
}

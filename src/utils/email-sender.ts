import { resend } from "@/infrastructure/resend";
import { render } from "@react-email/render";
import { formatDateTime } from "@/utils/calendar-utils";
import { ISendMagicLinkParams } from "@/types/email";
import prisma from "@/infrastructure/prisma";

import MagicLinkEmail from "@/emails/MagicLink";
import CancelAppointmentEmail from "@/emails/CancelAppointmentEmail";
import NewDeviceAlertEmail from "@/emails/NewDeviceAlertEmail";
import UniversalEmail from "@/emails/UniversalEmail";
import { Reservation } from "@prisma/client";

const DEFAULT_FROM = process.env.EMAIL_FROM || "Gabinet Paulina Kawka-Mirek <onboarding@resend.dev>";
const SYSTEM_FROM = process.env.EMAIL_FROM || "System MindCare <onboarding@resend.dev>";

async function sendEmailBase(
    to: string,
    subject: string,
    reactComponent: React.ReactElement,
    from = DEFAULT_FROM
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[Resend Warn] Brak RESEND_API_KEY - pomijanie wysyłki maila: "${subject}" do: ${to}`);
        return false;
    }
    try {
        const html = await render(reactComponent);
        await resend.emails.send({ from, to, subject, html });
        return true;
    } catch (error) {
        console.error(`[Resend Error] Błąd wysyłania e-maila (${subject}) do ${to}:`, error);
        return false;
    }
}

export async function getAdminNotificationEmail(): Promise<string> {
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        return process.env.ADMIN_NOTIFICATION_EMAIL;
    }
    const admin = await prisma.admin.findFirst({ select: { email: true } });
    if (admin?.email) return admin.email;

    const settings = await prisma.clinicSettings.findFirst({ select: { email: true } });
    if (settings?.email) return settings.email;

    return "kontakt@paulinakawkamirek.pl";
}

export async function sendMagicLinkEmail({
                                             email, patientName, date, serviceName, magicToken, status, bankAccount
                                         }: ISendMagicLinkParams) {
    const { formattedDate, formattedTime } = formatDateTime(date);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return sendEmailBase(
        email,
        `Potwierdzenie zgłoszenia rezerwacji: ${formattedDate}`,
        MagicLinkEmail({
            patientName,
            date: formattedDate,
            time: formattedTime,
            serviceName,
            magicLink: `${baseUrl}/reservation/success?token=${magicToken}`,
            status,
            bankAccount
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
                                              email, patientName, date, serviceName, magicToken
                                          }: {
    email: string; patientName: string; date: Date; serviceName: string; magicToken?: string
}) {
    const { formattedDate, formattedTime } = formatDateTime(date);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = magicToken ? `${baseUrl}/reservation/success?token=${magicToken}` : baseUrl;

    return sendEmailBase(
        email,
        `Nowy termin wizyty: ${formattedDate}`,
        MagicLinkEmail({ patientName, date: formattedDate, time: formattedTime, serviceName, magicLink: link })
    );
}

export async function sendNewDeviceAlertEmail({
                                                  adminEmail, adminName, deviceInfo, ipAddress
                                              }: {
    adminEmail: string; adminName: string; deviceInfo: string; ipAddress: string
}) {
    const { formattedDate, formattedTime } = formatDateTime(new Date());

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
                                                       adminEmail, patientName, date, serviceName
                                                   }: {
    adminEmail: string; patientName: string; date: Date; serviceName: string
}) {
    const { formattedDate, formattedTime } = formatDateTime(date);

    return sendEmailBase(
        adminEmail,
        `Nowa rezerwacja do wyceny: ${patientName} (${formattedDate})`,
        UniversalEmail({
            title: "Masz nową rezerwację!",
            previewText: `Nowy pacjent: ${patientName} zapisał się na ${formattedDate}`,
            greeting: `Cześć Paulina,`,
            message: `W Twoim kalendarzu pojawiła się nowa wizyta wstępna.\n\nSzczegóły spotkania:\nPacjent: ${patientName}\nUsługa: ${serviceName}\nData: ${formattedDate}\nGodzina: ${formattedTime}\n\nWizyta oczekuje na przesłanie linku do płatności Revolut lub danych do przelewu. Zaloguj się do panelu, aby zarządzać rezerwacją.`,
            actionLabel: "Przejdź do rezerwacji",
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
    const { formattedDate, formattedTime } = formatDateTime(date);

    return sendEmailBase(
        adminEmail,
        `Prośba o zmianę terminu: ${patientName}`,
        UniversalEmail({
            title: "Prośba o zmianę terminu",
            previewText: `${patientName} prosi o zmianę daty wizyty.`,
            greeting: `Cześć,`,
            message: `Pacjent ${patientName} poprosił przed chwilą o zmianę terminu wizyty zaplanowanej na ${formattedDate} o godzinie ${formattedTime}.\n\nSkontaktuj się z pacjentem, aby ustalić nowy termin i odblokować tę godzinę w kalendarzu.`,
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
            message: `Przypominam o jutrzejszej wizycie w moim gabinecie:\n\nUsługa: ${serviceName}\nData: ${formattedDate}\nGodzina: ${formattedTime}\n\nJeśli nie będziesz w stanie dotrzeć, bardzo proszę o jak najszybszą informację (możesz po prostu odpisać na tego e-maila), abym mogła zaproponować ten termin komuś z listy rezerwowej.\n\nDo zobaczenia!`
        })
    );
}

export async function sendAdminDailyReportEmail({
                                                    adminEmail, appointmentsCount, firstAppointment, date
                                                }: {
    adminEmail: string; appointmentsCount: number; firstAppointment?: Reservation; date: Date
}) {
    const { formattedDate } = formatDateTime(date);

    let message = `Masz dzisiaj zaplanowanych wizyt: ${appointmentsCount}.\n\n`;
    if (firstAppointment) {
        const { formattedTime } = formatDateTime(firstAppointment.date);
        message += `Pierwszy pacjent: ${firstAppointment.patientName} o godzinie ${formattedTime}.\n\n`;
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
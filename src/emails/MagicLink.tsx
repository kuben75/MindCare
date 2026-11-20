import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";
import { emailTheme } from "@/emails/theme";
import { IMagicLinkEmailProps } from "@/types/email";
import { PENDING_HOLD_HOURS } from "@/constants/reservations";

export const MagicLinkEmail = ({
                                   patientName = "Pacjencie",
                                   date = "data wizyty",
                                   time = "14:00",
                                   serviceName = "Konsultacja psychologiczna",
                                   magicLink = "https://paulinakmirek.pl",
                                   status,
                                   clinicPhone,
                                   clinicEmail,
                                   price
                               }: IMagicLinkEmailProps) => {

    const firstName = patientName.split(' ')[0];
    const isPending = status === "PENDING";

    return (
        <Html>
            <Head />
            <Preview>
                {isPending ? "Rezerwacja wstępna – skontaktuj się w sprawie płatności - Paulina Kawka-Mirek" : "Potwierdzenie rezerwacji wizyty - Paulina Kawka-Mirek"}
            </Preview>
            <Body style={emailTheme.main}>
                <Container style={emailTheme.container}>
                    <Section style={emailTheme.header}>
                        <Heading style={emailTheme.heading}>
                            {isPending ? "Rezerwacja w toku" : "Wizyta potwierdzona"}
                        </Heading>
                    </Section>

                    <Section style={emailTheme.content}>
                        <Text style={emailTheme.paragraph}>
                            Cześć {firstName},
                        </Text>

                        <Text style={emailTheme.paragraph}>
                            {isPending
                                ? "Dziękuję za rezerwację terminu. Twoja wizyta została wstępnie zapisana w moim kalendarzu. Aby ją w pełni potwierdzić, potrzebna jest płatność. Poniżej znajdziesz szczegóły:"
                                : "Dziękuję! Płatność została zaksięgowana, a Twoja wizyta jest potwierdzona. Poniżej znajdziesz jej szczegóły:"
                            }
                        </Text>

                        <Section style={emailTheme.detailsBox}>
                            <Text style={emailTheme.detailsText}><strong>Usługa:</strong> {serviceName}</Text>
                            <Text style={emailTheme.detailsText}><strong>Data:</strong> {date}</Text>
                            <Text style={emailTheme.detailsText}><strong>Godzina:</strong> {time} (czas polski)</Text>
                        </Section>

                        {isPending && (
                            <Section style={{ backgroundColor: "#fffbeb", padding: "16px", borderRadius: "12px", border: "1px solid #fde68a", marginTop: "16px", marginBottom: "16px" }}>
                                <Text style={{ margin: 0, fontWeight: "bold", color: "#b45309", fontSize: "16px" }}>
                                    Płatność za wizytę
                                </Text>
                                <Text style={{ margin: "8px 0 0 0", color: "#4b5563", fontSize: "14px", lineHeight: "1.5" }}>
                                    Aby potwierdzić ten termin, skontaktuj się ze mną w sprawie płatności{price ? ` (${price} zł)` : ""}
                                    {clinicPhone || clinicEmail ? ":" : " – wystarczy odpowiedzieć na tę wiadomość."}
                                </Text>
                                {clinicPhone && (
                                    <Text style={{ margin: "8px 0 0 0", color: "#1f2937", fontSize: "15px", fontWeight: "bold" }}>
                                        Telefon: {clinicPhone}
                                    </Text>
                                )}
                                {clinicEmail && (
                                    <Text style={{ margin: "4px 0 0 0", color: "#1f2937", fontSize: "15px", fontWeight: "bold" }}>
                                        E-mail: {clinicEmail}
                                    </Text>
                                )}
                                <Text style={{ margin: "12px 0 0 0", color: "#4b5563", fontSize: "12px", lineHeight: "1.5" }}>
                                    Po zaksięgowaniu płatności otrzymasz osobny e-mail z potwierdzeniem wizyty. Nieopłacona rezerwacja zostanie automatycznie anulowana po {PENDING_HOLD_HOURS} godzinach.
                                </Text>
                            </Section>
                        )}

                        <Text style={emailTheme.paragraph}>
                            Poniżej znajduje się Twój prywatny link do zarządzania wizytą. Możesz z niego skorzystać w dowolnej chwili, aby sprawdzić status lub odwołać spotkanie.
                        </Text>

                        <Section style={emailTheme.buttonContainer}>
                            <Button style={emailTheme.button} href={magicLink}>
                                Zarządzaj swoją wizytą
                            </Button>
                        </Section>

                        <Hr style={emailTheme.hr} />

                        <Text style={emailTheme.footer}>
                            Zapisz tę wiadomość. W razie jakichkolwiek pytań, po prostu odpisz na ten e-mail.
                        </Text>
                        <Text style={emailTheme.footerSignature}>
                            Pozdrawiam ciepło,<br />
                            Paulina Kawka-Mirek
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};
export default MagicLinkEmail;
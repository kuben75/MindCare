import {
    Body,
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
import {ICancelAppointmentEmailProps} from "@/types/email";

export const CancelAppointmentEmail = ({
                                           patientName = "Pacjencie",
                                           date = "data wizyty",
                                           time = "14:00",
                                           serviceName = "Konsultacja psychologiczna",
                                           reason,
                                       }: ICancelAppointmentEmailProps) => {

    const firstName = patientName.split(' ')[0];

    return (
        <Html>
            <Head />
            <Preview>Ważne: Odwołanie wizyty - Paulina Kawka-Mirek</Preview>
            <Body style={emailTheme.main}>
                <Container style={emailTheme.container}>
                    <Section style={{ ...emailTheme.header, backgroundColor: "#2D3436" }}>
                        <Heading style={emailTheme.heading}>Wizyta odwołana</Heading>
                    </Section>

                    <Section style={emailTheme.content}>
                        <Text style={emailTheme.paragraph}>
                            Cześć {firstName},
                        </Text>
                        <Text style={emailTheme.paragraph}>
                            Z przykrością informuję, że nasza zaplanowana wizyta musiała zostać odwołana. Poniżej znajdują się szczegóły anulowanego spotkania:
                        </Text>

                        <Section style={emailTheme.detailsBox}>
                            <Text style={emailTheme.detailsText}><strong>Usługa:</strong> {serviceName}</Text>
                            <Text style={emailTheme.detailsText}><strong>Data:</strong> {date}</Text>
                            <Text style={emailTheme.detailsText}><strong>Godzina:</strong> {time}</Text>
                            {reason && (
                                <Text style={{ ...emailTheme.detailsText, marginTop: "10px", color: "#b91c1c" }}>
                                    <strong>Powód:</strong> {reason}
                                </Text>
                            )}
                        </Section>

                        <Text style={emailTheme.paragraph}>
                            Aby ustalić nowy termin spotkania, proszę o kontakt mailowy (wystarczy odpisać na tę wiadomość) lub rezerwację przez moją stronę internetową.
                        </Text>

                        <Hr style={emailTheme.hr} />

                        <Text style={emailTheme.footerSignature}>
                            Pozdrawiam ciepło,<br />
                            Paulina Kmirek
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};
export default CancelAppointmentEmail;
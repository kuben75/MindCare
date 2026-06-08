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
import {INewDeviceAlertEmailProps} from "@/types/email";


export const NewDeviceAlertEmail = ({
                                        adminName = "Paulina",
                                        deviceInfo = "Mac OS - Chrome",
                                        ipAddress = "192.168.1.1",
                                        time = "14:30, 05 czerwca 2026",
                                    }: INewDeviceAlertEmailProps) => {

    return (
        <Html>
            <Head />
            <Preview>Alert bezpieczeństwa: Nowe logowanie na Twoje konto</Preview>
            <Body style={emailTheme.main}>
                <Container style={emailTheme.container}>
                    <Section style={{ ...emailTheme.header, backgroundColor: "#b91c1c" }}>
                        <Heading style={emailTheme.heading}>Nowe urządzenie</Heading>
                    </Section>

                    <Section style={emailTheme.content}>
                        <Text style={emailTheme.paragraph}>
                            Cześć {adminName},
                        </Text>
                        <Text style={emailTheme.paragraph}>
                            Wykryliśmy nowe logowanie do Twojego panelu zarządzania gabinetem. Jeśli to byłaś Ty, możesz zignorować tę wiadomość.
                        </Text>

                        <Section style={emailTheme.detailsBox}>
                            <Text style={emailTheme.detailsText}><strong>Urządzenie:</strong> {deviceInfo}</Text>
                            <Text style={emailTheme.detailsText}><strong>Adres IP:</strong> {ipAddress}</Text>
                            <Text style={emailTheme.detailsText}><strong>Czas:</strong> {time}</Text>
                        </Section>

                        <Text style={emailTheme.paragraph}>
                            <strong>Jeśli to nie Ty:</strong> Natychmiast zaloguj się do panelu, wejdź w zakładkę <strong>Bezpieczeństwo</strong> i kliknij &quot;Wyloguj urządzenie&quot; przy podejrzanej sesji, a następnie zmień swoje hasło.
                        </Text>

                        <Hr style={emailTheme.hr} />
                        <Text style={emailTheme.footer}>
                            Wiadomość wygenerowana automatycznie przez system zabezpieczeń Twojego gabinetu.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};
export default NewDeviceAlertEmail;
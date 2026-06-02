import {Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button,} from "@react-email/components";
import * as React from "react";
import {emailTheme} from "@/emails/theme";
import {IUniversalEmailProps} from "@/types/email";

export const UniversalEmail = ({title = "Powiadomienie",
                                   previewText = "Nowa wiadomość z gabinetu",
                                   greeting = "Dzień dobry,",
                                   message = "Treść wiadomości",
                                   actionLabel,
                                   actionUrl,
                               }: IUniversalEmailProps) => {

    return (
        <Html>
            <Head/>
            <Preview>{previewText}</Preview>
            <Body style={emailTheme.main}>
                <Container style={emailTheme.container}>
                    <Section style={emailTheme.header}>
                        <Heading style={emailTheme.heading}>{title}</Heading>
                    </Section>

                    <Section style={emailTheme.content}>
                        <Text style={emailTheme.paragraph}>
                            {greeting}
                        </Text>

                        <Text style={{...emailTheme.paragraph, whiteSpace: "pre-wrap"}}>
                            {message}
                        </Text>
                        {actionLabel && actionUrl && (
                            <Section style={emailTheme.buttonContainer}>
                                <Button style={emailTheme.button} href={actionUrl}>
                                    {actionLabel}
                                </Button>
                            </Section>
                        )}

                        <Hr style={emailTheme.hr}/>

                        <Text style={emailTheme.footerSignature}>
                            Pozdrawiam ciepło,<br/>
                            Paulina Kawka-Mirek
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};
export default UniversalEmail;
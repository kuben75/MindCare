import { useEffect, useState } from "react";
import { TDeviceSession } from "@/types/security";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { useRouter } from "next/navigation";

export const useSecurityHub = ({ is2FAEnabled }: { is2FAEnabled: boolean }) => {
    const [activeTutorial, setActiveTutorial] = useState<'2FA' | null>(null);
    const [tutorialStep, setTutorialStep] = useState(1);
    const [isEnabled, setIsEnabled] = useState(is2FAEnabled);
    const [isLoading, setIsLoading] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mobileOS, setMobileOS] = useState<'ios' | 'android'>('ios');
    const [verificationCode, setVerificationCode] = useState("");

    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState(false);

    const [activeSessions, setActiveSessions] = useState<TDeviceSession[]>([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(true);

    const { toast, showToast, hideToast } = useToast();
    const confirm = useConfirm();
    const router = useRouter();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch('/api/admin/security/sessions');
                if (res.ok) {
                    const data = await res.json();
                    setActiveSessions(data.sessions || []);
                }
            } catch (e) {
                console.error("Błąd pobierania sesji", e);
                showToast("Nie udało się pobrać listy urządzeń.", "error");
            } finally {
                setIsSessionsLoading(false);
            }
        };
        fetchSessions();
    }, [showToast]);

    const handleRevokeSession = async (sessionId: string) => {
        const hasConfirmed = await confirm("Zakończyć sesję dla tego urządzenia? Użytkownik natychmiast utraci dostęp i będzie musiał zalogować się ponownie.", {
            title: "Wyloguj urządzenie",
            confirmLabel: "Tak, wyloguj",
            type: "danger"
        });

        if (!hasConfirmed) return;

        try {
            const res = await fetch('/api/admin/security/sessions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            if (res.ok) {
                setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
                showToast("Sesja została pomyślnie zakończona.", "success");
            } else {
                showToast("Nie udało się wylogować urządzenia.", "error");
            }
        } catch (e) {
            showToast("Błąd połączenia z serwerem.", "error");
        }
    };

    const handleNext = async () => {
        setErrorMessage(null);
        if (tutorialStep === 3) {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/security/2fa/generate', { method: "POST" });
                if (res.ok) {
                    const data = await res.json();
                    setQrCodeData(data.qrCodeUrl);
                    if (data.recoveryCodes) setRecoveryCodes(data.recoveryCodes);
                    setTutorialStep(4);
                } else {
                    showToast("Błąd serwera. Nie można wygenerować kodu QR.", "error");
                }
            } catch (e) {
                setErrorMessage("Wystąpił błąd podczas generowania kodu. Spróbuj ponownie.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setTutorialStep(prev => prev + 1);
        }
    };

    const handlePrev = () => setTutorialStep(prev => prev - 1);

    const closeTutorial = () => {
        setActiveTutorial(null);
        setTimeout(() => {
            setTutorialStep(1);
            setVerificationCode("");
            setIsCopied(false);
        }, 300);
    };

    const handleVerifyAndEnable = async () => {
        if (verificationCode.length < 6) return;
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const res = await fetch('/api/admin/security/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: verificationCode })
            });

            if (res.ok) {
                setIsEnabled(true);
                setTutorialStep(5);
                showToast("Zabezpieczenie 2FA zostało aktywowane!", "success");
                router.refresh();
            } else {
                const data = await res.json();
                setErrorMessage(data.error || "Nieprawidłowy kod.");
            }
        } catch (e) {
            setErrorMessage("Błąd połączenia. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        const hasConfirmed = await confirm("Wyłączenie weryfikacji 2FA znacząco obniży bezpieczeństwo Twojego konta. Czy na pewno chcesz to zrobić?", {
            title: "Wyłącz 2FA",
            confirmLabel: "Tak, wyłącz zabezpieczenia",
            type: "danger"
        });

        if (!hasConfirmed) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/security/2fa/disable', { method: 'POST' });
            if (res.ok) {
                setIsEnabled(false);
                setRecoveryCodes([]);
                showToast("Zabezpieczenie 2FA zostało wyłączone.", "info");
                router.refresh();
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || "Nie udało się wyłączyć 2FA.", "error");
            }
        } catch (e) {
            showToast("Błąd połączenia z serwerem.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCodes = () => {
        if (recoveryCodes.length === 0) return;
        const textToCopy = recoveryCodes.join("\n");
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return {
        activeTutorial, setActiveTutorial, tutorialStep, handleNext, handlePrev, closeTutorial,
        isEnabled, isLoading, qrCodeData, errorMessage, mobileOS, setMobileOS,
        verificationCode, setVerificationCode, handleVerifyAndEnable, handleDisable,
        recoveryCodes, isCopied, handleCopyCodes, activeSessions, isSessionsLoading, handleRevokeSession,
        toast, hideToast
    };
};
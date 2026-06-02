import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";


export const useLoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            twoFactorCode: requires2FA ? twoFactorCode : undefined,
            redirect: false,
        });

        if (res?.error) {
            if (res.error === "2FA_REQUIRED") {
                setRequires2FA(true);
            } else if (res.error === "INVALID_2FA") {
                setError(isRecoveryMode ? "Nieprawidłowy kod zapasowy." : "Nieprawidłowy kod autoryzacyjny. Spróbuj ponownie.");
            } else {
                setError(res.error);
            }
            setIsLoading(false);
        } else {
            router.push("/admin/dashboard");
            router.refresh();
        }
    };

    const handleRecoveryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (val.length > 4) {
            val = val.substring(0, 4) + '-' + val.substring(4, 8);
        }
        setTwoFactorCode(val);
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        error,
        isLoading,
        requires2FA,
        twoFactorCode,
        setTwoFactorCode,
        isRecoveryMode,
        setIsRecoveryMode,
        handleSubmit,
        handleRecoveryCodeChange,
        setError,
        setRequires2FA
    }
}

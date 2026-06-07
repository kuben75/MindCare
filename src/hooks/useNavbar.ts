import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {useSettings} from "@/context/SettingsContext";


export const useNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const settings = useSettings();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isAdmin = pathname?.startsWith("/admin");

    return {
        isOpen,
        setIsOpen,
        scrolled,
        settings,
        isAdmin
    }
}
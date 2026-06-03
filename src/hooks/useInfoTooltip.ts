import {useEffect, useRef, useState} from "react";
import {IInfoTooltipProps} from "@/types/settings";


export const useInfoTooltip = ({ title, description, images }: IInfoTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [placement, setPlacement] = useState<'top' | 'bottom'>('top');

    const buttonRef = useRef<HTMLButtonElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (lightboxImage || (isVisible && isMobile)) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [lightboxImage, isVisible, isMobile]);

    const calculatePlacement = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        if (rect.top < 320) {
            setPlacement('bottom');
        } else {
            setPlacement('top');
        }
    };

    const handleMouseEnter = () => {
        if (isMobile) return;
        calculatePlacement();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150);
    };

    const toggleVisibility = () => {
        calculatePlacement();
        setIsVisible(!isVisible);
    };

    return {
        buttonRef,
        isVisible,
        lightboxImage,
        setLightboxImage,
        mounted,
        isMobile,
        placement,
        handleMouseEnter,
        handleMouseLeave,
        toggleVisibility,
        setIsVisible
    }
}
import {Variants} from "framer-motion";

export const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

export const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring" as const, bounce: 0.3, duration: 0.5 }
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: { duration: 0.2 }
    }
};

export const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
};
import {Variants} from "framer-motion";

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, filter: "blur(2px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1] as [number, number, number, number]
        }
    },
};
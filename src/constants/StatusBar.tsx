import {TStatusColor} from "@/types/finances";

export const STATUS_STYLES: Record<TStatusColor, { bar: string; num: string; bg: string }> = {
    emerald: {
        bar: "bg-sage dark:bg-emerald-500",
        num: "text-sage dark:text-emerald-400",
        bg:  "bg-sage/8 dark:bg-emerald-900/15 border-sage/15 dark:border-emerald-800/20",
    },
    blue: {
        bar: "bg-blue-400 dark:bg-blue-500",
        num: "text-blue-600 dark:text-blue-400",
        bg:  "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/30 dark:border-blue-800/20",
    },
    red: {
        bar: "bg-red-400 dark:bg-red-500",
        num: "text-red-500 dark:text-red-400",
        bg:  "bg-red-50/50 dark:bg-red-900/10 border-red-200/30 dark:border-red-800/20",
    },
};
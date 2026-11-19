import { z } from "zod";
import { isAllowedUrl } from "@/lib/sanitize-blog";

const safeLink = z
    .string()
    .trim()
    .max(500, "Link jest za długi")
    .refine(
        (val) => val.startsWith("#") || isAllowedUrl(val, true),
        "Link musi być ścieżką względną (/...), kotwicą (#...) lub adresem http(s)"
    );

export const heroTemplateSchema = z.object({
    title: z.string().trim().min(1, "Tytuł jest wymagany").max(300, "Tytuł jest za długi"),
    subtitle: z.string().trim().max(1000, "Podtytuł jest za długi"),
    imageUrl: z
        .string()
        .trim()
        .max(1000)
        .refine((val) => isAllowedUrl(val, true), "Nieprawidłowy adres URL obrazu")
        .nullable()
        .optional(),
    layout: z.enum(["TEXT_LEFT", "TEXT_RIGHT"]).optional(),
    imageStyle: z.enum(["HORIZONTAL", "VERTICAL", "SQUARE"]).optional(),
    showPrimaryButton: z.boolean().optional(),
    primaryButtonText: z.string().trim().max(100, "Tekst przycisku jest za długi").optional(),
    primaryButtonLink: safeLink.optional(),
    showZnanyLekarz: z.boolean().optional(),
});

export type HeroTemplateInput = z.infer<typeof heroTemplateSchema>;

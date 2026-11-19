import sanitizeHtml from "sanitize-html";

const ALLOWED_EMBED_HOSTS = new Set([
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
    "player.vimeo.com",
]);

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        "p", "br", "b", "i", "em", "strong", "u", "s", "strike", "mark",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li",
        "blockquote", "pre", "code", "hr",
        "a", "img", "figure", "figcaption",
        "table", "thead", "tbody", "tr", "th", "td",
        "div", "span", "iframe",
    ],
    allowedAttributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt", "title", "width", "height", "loading"],
        iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "frameborder"],
        "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
        img: ["http", "https"],
        iframe: ["https"],
    },
    allowedIframeHostnames: Array.from(ALLOWED_EMBED_HOSTS),
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: {
                ...attribs,
                ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
            },
        }),
    },
};

export function sanitizeBlogHtml(dirtyHtml: string): string {
    return sanitizeHtml(dirtyHtml, SANITIZE_OPTIONS);
}

export function isAllowedUrl(rawUrl: string, allowRelative = true): boolean {
    const trimmed = rawUrl.trim();
    if (!trimmed) return false;
    if (allowRelative && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
        return true;
    }
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

export function isAllowedEmbedUrl(rawUrl: string): boolean {
    try {
        const parsed = new URL(rawUrl.trim());
        return parsed.protocol === "https:" && ALLOWED_EMBED_HOSTS.has(parsed.hostname.toLowerCase());
    } catch {
        return false;
    }
}

interface EditorBlock {
    id?: string;
    type: string;
    data: Record<string, unknown>;
}

interface EditorPayload {
    time?: number;
    version?: string;
    blocks: EditorBlock[];
}

function sanitizeInlineText(value: unknown): string {
    if (typeof value !== "string") return "";
    return sanitizeHtml(value, {
        allowedTags: ["b", "i", "u", "s", "strong", "em", "mark", "code", "a", "br", "span"],
        allowedAttributes: {
            a: ["href", "target", "rel"],
            span: ["class"],
        },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: {
            a: (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...attribs,
                    ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
                },
            }),
        },
    });
}

function sanitizeListItems(items: unknown[]): unknown[] {
    return items.map((item) => {
        if (typeof item === "string") {
            return sanitizeInlineText(item);
        }
        if (item && typeof item === "object") {
            const obj = item as Record<string, unknown>;
            return {
                ...obj,
                ...(typeof obj.content === "string" ? { content: sanitizeInlineText(obj.content) } : {}),
                ...(Array.isArray(obj.items) ? { items: sanitizeListItems(obj.items) } : {}),
            };
        }
        return "";
    });
}

export function validateAndSanitizePostContent(
    rawContent: unknown
): { ok: true; sanitized: string | EditorPayload } | { ok: false; error: string } {
    const isStringInput = typeof rawContent === "string";
    let parsed: unknown = rawContent;

    if (isStringInput) {
        try {
            parsed = JSON.parse(rawContent);
        } catch {
            return { ok: false, error: "Nieprawidłowy format treści artykułu (oczekiwano JSON)." };
        }
    }

    if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as EditorPayload).blocks)) {
        return { ok: false, error: "Treść artykułu musi zawierać poprawną strukturę bloków." };
    }

    const payload = parsed as EditorPayload;
    const sanitizedBlocks: EditorBlock[] = [];

    for (const block of payload.blocks) {
        if (!block || typeof block.type !== "string" || !block.data || typeof block.data !== "object") {
            continue;
        }

        const data = { ...block.data };

        if (block.type === "embed") {
            const embedUrl = typeof data.embed === "string" ? data.embed : "";
            if (!isAllowedEmbedUrl(embedUrl)) {
                return {
                    ok: false,
                    error: "Niedozwolone źródło osadzenia (embed). Dozwolone są wyłącznie filmy z YouTube oraz Vimeo.",
                };
            }
        }

        if (block.type === "image") {
            const fileObj = data.file as { url?: unknown } | undefined;
            const imageUrl = typeof fileObj?.url === "string" ? fileObj.url : typeof data.url === "string" ? data.url : "";
            if (!isAllowedUrl(imageUrl, true)) {
                return {
                    ok: false,
                    error: "Nieprawidłowy adres URL obrazu w artykule.",
                };
            }
        }

        if (typeof data.text === "string") data.text = sanitizeInlineText(data.text);
        if (typeof data.title === "string") data.title = sanitizeInlineText(data.title);
        if (typeof data.message === "string") data.message = sanitizeInlineText(data.message);
        if (typeof data.caption === "string") data.caption = sanitizeInlineText(data.caption);

        if (block.type === "list" && Array.isArray(data.items)) {
            data.items = sanitizeListItems(data.items);
        }

        if (block.type === "table" && Array.isArray(data.content)) {
            data.content = data.content.map((row) =>
                Array.isArray(row) ? row.map((cell) => sanitizeInlineText(cell)) : []
            );
        }

        sanitizedBlocks.push({
            ...block,
            data,
        });
    }

    const cleanPayload: EditorPayload = {
        ...payload,
        blocks: sanitizedBlocks,
    };

    return {
        ok: true,
        sanitized: isStringInput ? JSON.stringify(cleanPayload) : cleanPayload,
    };
}
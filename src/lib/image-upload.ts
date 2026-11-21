/**
 * Client-side image preparation + upload for the admin editors (hero, blog).
 *
 * Vercel rejects request bodies above ~4.5 MB with HTTP 413 before our route even runs, and
 * phone photos are often 5–12 MB. Images are therefore downscaled (longest side ≤ MAX_DIMENSION)
 * and re-encoded as WebP in the browser before upload. GIFs are sent as-is (keeps animation).
 */

/** Must stay below Vercel's request body limit (multipart overhead included). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_DIMENSION = 2000;
const SKIP_BELOW_BYTES = 500 * 1024;

export class ImageUploadError extends Error {}

/** Scales (width, height) down so the longer side is at most `max`; never upscales. */
export function fitWithin(width: number, height: number, max = MAX_DIMENSION): { width: number; height: number } {
    const longest = Math.max(width, height);
    if (longest <= max) return { width, height };
    const ratio = max / longest;
    return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Downscales and re-encodes an image so it fits the upload limit. */
export async function prepareImageForUpload(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) {
        throw new ImageUploadError("Wybrany plik nie jest obrazem.");
    }

    if (file.type === "image/gif") {
        if (file.size > MAX_UPLOAD_BYTES) {
            throw new ImageUploadError(`GIF jest za duży (${formatMb(file.size)}). Maksymalnie ${formatMb(MAX_UPLOAD_BYTES)}.`);
        }
        return file;
    }

    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        // Format the browser can't decode (e.g. HEIC outside Safari).
        if (file.size <= MAX_UPLOAD_BYTES) return file;
        throw new ImageUploadError("Nie udało się odczytać zdjęcia. Zapisz je jako JPG lub PNG i spróbuj ponownie.");
    }

    const target = fitWithin(bitmap.width, bitmap.height);
    const alreadySmall = file.size <= SKIP_BELOW_BYTES && target.width === bitmap.width && target.height === bitmap.height;
    if (alreadySmall && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        bitmap.close();
        return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        bitmap.close();
        if (file.size <= MAX_UPLOAD_BYTES) return file;
        throw new ImageUploadError("Twoja przeglądarka nie potrafi zmniejszyć zdjęcia. Wybierz mniejszy plik.");
    }
    ctx.drawImage(bitmap, 0, 0, target.width, target.height);
    bitmap.close();

    for (const quality of [0.85, 0.75, 0.6]) {
        let blob = await canvasToBlob(canvas, "image/webp", quality);
        // Very old browsers ignore WebP and return PNG — fall back to JPEG then.
        if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality);
        if (blob && blob.size <= MAX_UPLOAD_BYTES) {
            const ext = blob.type === "image/webp" ? "webp" : "jpg";
            const baseName = file.name.replace(/\.[^.]*$/, "") || "zdjecie";
            return new File([blob], `${baseName}.${ext}`, { type: blob.type });
        }
    }

    throw new ImageUploadError("Nie udało się zmniejszyć zdjęcia poniżej limitu. Wybierz mniejszy plik.");
}

/** Prepares and uploads an image; returns its public URL or throws ImageUploadError with a readable message. */
export async function uploadImage(file: File): Promise<string> {
    const prepared = await prepareImageForUpload(file);
    const formData = new FormData();
    formData.append("image", prepared);

    let response: Response;
    try {
        response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    } catch {
        throw new ImageUploadError("Brak połączenia z serwerem. Spróbuj ponownie.");
    }

    if (response.status === 413) {
        throw new ImageUploadError(`Plik jest za duży dla serwera. Maksymalny rozmiar to ${formatMb(MAX_UPLOAD_BYTES)}.`);
    }
    if (response.status === 401) {
        throw new ImageUploadError("Sesja wygasła. Zaloguj się ponownie.");
    }

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.file?.url) {
        throw new ImageUploadError(data?.error || "Nie udało się wgrać zdjęcia na serwer.");
    }
    return data.file.url as string;
}

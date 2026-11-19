
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "node:path";
import { requireAdmin } from "@/lib/requireAdmin";
import { detectImageType } from "@/lib/image-type";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({message: "Invaid credentials"}, {status: 401});
    }

    try {
        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ success: 0, error: "Nie przesłano poprawnego pliku." }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({
                success: 0,
                error: "Niedozwolony format pliku. Dozwolone: JPG, PNG, WEBP, GIF."
            }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                success: 0,
                error: "Plik jest zbyt duży. Maksymalny rozmiar to 5 MB."
            }, { status: 400 });
        }
        // The browser-supplied MIME type and file name are attacker-controlled: detect the real
        // format from the file's magic bytes and derive extension + Content-Type from it.
        const buffer = Buffer.from(await file.arrayBuffer());
        const detected = detectImageType(buffer);
        if (!detected) {
            return NextResponse.json({
                success: 0,
                error: "Plik nie jest poprawnym obrazem JPG, PNG, WEBP ani GIF."
            }, { status: 400 });
        }

        const baseName = path.basename(file.name).replace(/\.[^.]*$/, "");
        const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-]/g, "_").slice(0, 80) || "image";
        const blobPath = `uploads/${Date.now()}-${sanitizedBaseName}.${detected.ext}`;

        const blob = await put(blobPath, buffer, {
            access: "public",
            contentType: detected.mime,
        });

        return NextResponse.json({
            success: 1,
            file: {
                url: blob.url,
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Błąd podczas uploadu pliku do Vercel Blob:", error);
        return NextResponse.json({
            success: 0,
            error: "Wystąpił błąd serwera podczas zapisywania pliku."
        }, { status: 500 });
    }
}
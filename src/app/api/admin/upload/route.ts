import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { put } from "@vercel/blob";
import path from "node:path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ success: 0, error: "Brak autoryzacji" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ success: 0, error: "Nie przesłano poprawnego pliku." }, { status: 400 });
        }

        // 1. Walidacja typu MIME
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({
                success: 0,
                error: "Niedozwolony format pliku. Dozwolone: JPG, PNG, WEBP, GIF."
            }, { status: 400 });
        }

        // 2. Walidacja rozmiaru
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                success: 0,
                error: "Plik jest zbyt duży. Maksymalny rozmiar to 5 MB."
            }, { status: 400 });
        }

        // 3. Bezpieczna nazwa pliku (usunięcie ścieżek ../ i spacji)
        const rawFileName = path.basename(file.name);
        const sanitizedFileName = rawFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blobPath = `uploads/${Date.now()}-${sanitizedFileName}`;

        const blob = await put(blobPath, file, {
            access: "public",
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
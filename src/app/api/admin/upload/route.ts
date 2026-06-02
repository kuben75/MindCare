import {getServerSession} from "next-auth";
import {NextResponse} from "next/server";
import path from "node:path";
import {writeFile} from "node:fs/promises";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";


export async function POST(req: Request) {

    const session = await getServerSession(authOptions);
    if(!session) {
        return NextResponse.json({success: 0, error: "Unauthorized"}, {status: 401});
    }
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;
        if(!file) {
            return NextResponse.json({success: 0, error: "Nie przesłano pliku."}, {status: 400});
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        return NextResponse.json({success: 1, file: {
                url: `/uploads/${fileName}`,
            }})
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({success: 0, error: "Wystąpił błąd podczas przesyłania pliku."}, {status: 500});
    }
}
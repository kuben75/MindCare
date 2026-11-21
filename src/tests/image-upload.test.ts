import { describe, it, expect, vi, afterEach } from "vitest";
import { fitWithin, MAX_UPLOAD_BYTES, uploadImage, ImageUploadError, prepareImageForUpload } from "@/lib/image-upload";

describe("fitWithin", () => {
    it("downscales the longer side to 2000px keeping the aspect ratio", () => {
        expect(fitWithin(4000, 3000)).toEqual({ width: 2000, height: 1500 });
        expect(fitWithin(3024, 4032)).toEqual({ width: 1500, height: 2000 });
    });
    it("never upscales", () => {
        expect(fitWithin(1200, 800)).toEqual({ width: 1200, height: 800 });
    });
});

describe("upload limits", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("stays below Vercel's ~4.5 MB request body limit", () => {
        expect(MAX_UPLOAD_BYTES).toBeLessThan(4.3 * 1024 * 1024);
    });

    it("rejects non-images and oversized GIFs before uploading", async () => {
        await expect(prepareImageForUpload(new File(["x"], "a.pdf", { type: "application/pdf" }))).rejects.toBeInstanceOf(ImageUploadError);
        const bigGif = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "a.gif", { type: "image/gif" });
        await expect(prepareImageForUpload(bigGif)).rejects.toThrow(/za duży/);
    });

    it("turns a 413 into a readable message", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 413, ok: false, json: async () => ({}) }));
        const gif = new File([new Uint8Array(10)], "a.gif", { type: "image/gif" });
        await expect(uploadImage(gif)).rejects.toThrow(/za duży dla serwera/);
    });

    it("returns the uploaded URL on success", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 201, ok: true, json: async () => ({ success: 1, file: { url: "https://blob/x.gif" } }) }));
        const gif = new File([new Uint8Array(10)], "a.gif", { type: "image/gif" });
        await expect(uploadImage(gif)).resolves.toBe("https://blob/x.gif");
    });
});

import {IEditorContent} from "@/types/editor";

export const extractFirstImage = (contentStr: string): string | null => {
    try {
        const parsed = JSON.parse(contentStr);
        if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
            return null;
        }
        const imageBlock = parsed.blocks.find((b: IEditorContent) => b.type === 'image');

        return imageBlock?.data?.file?.url || null;
    }catch(e) {
        return null;
    }
}

export const extractExcerpt = (contentStr: string): string => {
    try {
        const parsed = JSON.parse(contentStr);
        if(!parsed.blocks || !Array.isArray(parsed.blocks)) {
            return "";
        }
        const paragraphBlock = parsed.blocks.find((b: IEditorContent) => b.type === 'paragraph');

        if (paragraphBlock && paragraphBlock.data?.text) {
            const cleanText = paragraphBlock.data.text.replace(/<[^>]*>?/gm, '');
            return cleanText.length > 120 ? cleanText.substring(0, 120) + "..." : cleanText;
        }
    }
    catch (e) {
        return "";
    }
    return "";
};
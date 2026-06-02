export const extractFirstImage = (contentStr: string) => {
    try {
        const parsed = JSON.parse(contentStr);
        if(!parsed.blocks) {
            return null;
        }
        const imageBlock = parsed.blocks.find((b: any) => b.type === 'image');
        return imageBlock ? imageBlock.data.file.url : null;
    }catch(e) {
        return null;
    }
}

export const extractExcerpt = (contentStr: string) => {
    try {
        const parsed = JSON.parse(contentStr);
        if(!parsed.blocks) {
            return "";
        }
        const paragraphBlock = parsed.blocks.find((b: any) => b.type === 'paragraph')
        if (paragraphBlock) {
            const cleanText = paragraphBlock.data.text.replace(/<[^>]*>?/gm, '');
            return cleanText.length > 120 ? cleanText.substring(0,120) + "..." : cleanText;
        }
    }
    catch (e) {
        return "";
    }
    return "";
};
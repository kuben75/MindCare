
export interface IBlockEditorProps {
    data: string;
    onChange: (data: string) => void;
}
export type TInitialData = {
    id?: string;
    title: string;
    content: string;
    isPublished: boolean;
}


export interface IEditorContent {
    type: string;
    data: {
        file?: {
            url: string;
        };
        text?: string;
        [key: string]: unknown;
    }
}

export interface IBlockEditorProps {
    data: string;
    onChange: (data: string) => void;
}
export type IInitialData = {
    id?: string;
    title: string;
    content: string;
    isPublished: boolean;
}
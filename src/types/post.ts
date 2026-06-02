
export type Post = {
    id: string;
    title: string;
    isPublished: boolean;
    order: number,
    createdAt: Date;
    slug?: string;
}
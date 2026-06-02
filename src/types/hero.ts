export type THeroLayout = "TEXT_LEFT" | "TEXT_RIGHT";
export type TImageStyle = "HORIZONTAL" | "VERTICAL" | "SQUARE";

export type THeroProps = {
    id?: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    layout: THeroLayout;
    imageStyle: TImageStyle;
    showPrimaryButton?: boolean;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    showZnanyLekarz?: boolean;
    isPreview?: boolean;
}
export type THeroTemplate = {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    layout: string;
    imageStyle: string;
    isActive: boolean;
    createdAt: string;
};
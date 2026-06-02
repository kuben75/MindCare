import prisma from "@/infrastructure/prisma";
import {notFound} from "next/navigation";
import HeroForm from "@/components/layout/HeroForm";


export default async function EditLandingTemplatePage({params}: {params: {id: string}}) {
    const {id} = await params;

    const template = await prisma.heroTemplate.findUnique({where: {id}});
    if(!template) {
        notFound();
    }

    return (
        <HeroForm
            initialData={{
                id: template.id,
                title: template.title,
                subtitle: template.subtitle,
                imageUrl: template.imageUrl || "",
                layout: template.layout as "TEXT_LEFT" | "TEXT_RIGHT",
                imageStyle: template.imageStyle as "HORIZONTAL" | "VERTICAL" | "SQUARE",
                showPrimaryButton: template.showPrimaryButton,
                primaryButtonText: template.primaryButtonText || "",
                primaryButtonLink: template.primaryButtonLink || "",
                showZnanyLekarz: template.showZnanyLekarz,
            }}
        />
    );
}

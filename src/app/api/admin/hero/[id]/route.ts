import {getServerSession} from "next-auth";
import {NextResponse} from "next/server";
import prisma from "@/infrastructure/prisma";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";


export async function PUT(req: Request, {params}: {params: Promise<{id: string}>}) {
    const session = await getServerSession(authOptions);
    if(!session) {
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }
    try{
        const {id} = await params;
        const body = await req.json();
        const updatedTemplate = await prisma.heroTemplate.update({
            where: {id},
            data: {
                title: body.title,
                subtitle: body.subtitle,
                imageUrl: body.imageUrl,
                layout: body.layout,
                imageStyle: body.imageStyle,
                showPrimaryButton: body.showPrimaryButton,
                primaryButtonText: body.primaryButtonText,
                primaryButtonLink: body.primaryButtonLink,
                showZnanyLekarz: body.showZnanyLekarz,
            }
        });
        return NextResponse.json(updatedTemplate);
    }catch (e) {
        console.error(e);
        return NextResponse.json({message: "Error updating template"}, {status: 500});
    }
}
export async function DELETE(req: Request, {params}: {params: Promise<{id: string}>}) {
    const session = await getServerSession(authOptions);
    if(!session) {
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }
    try{
        const {id} = await params;
        const template = await prisma.heroTemplate.findUnique({where: {id}});
        if(template?.isActive) {
            return NextResponse.json({message: "Nie możesz usunąć aktywnego szablonu."}, {status: 400});
        }
        await prisma.heroTemplate.delete({where: {id}});

        return NextResponse.json({success: true});
    }catch (e) {
        console.error(e);
        return NextResponse.json({message: "Error deleting template"}, {status: 500});
    }
}
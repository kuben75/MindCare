import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTransition} from "react";


export const useSystemLogsViewer = ({totalPages}: {totalPages: number }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };
    return {
        isPending,
        handlePageChange,
    }
}
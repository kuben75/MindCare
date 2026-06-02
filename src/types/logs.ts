import {SystemLog} from "@prisma/client";

export interface ISystemLogsViewerProps {
    logs: SystemLog[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
}

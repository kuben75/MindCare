
export interface IPatientHistory {
    id: string;
    date: string;
    status: string;
    serviceName: string;
    price: number;
    privateNotes: string | null;
}

export interface IPatient  {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    completedVisits: number;
    cancelledVisits: number;
    upcomingVisits: number;
    history: IPatientHistory[];
    lastVisitDate: string | null;
}
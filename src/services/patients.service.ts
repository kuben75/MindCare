import prisma from "@/infrastructure/prisma";


export const GetPatientsService = async () => {
    const allReservations = await prisma.reservation.findMany({
        include: {service: true},
        orderBy: {date: 'desc'}
    });

    const patientsMap = new Map();

    for (const res of allReservations) {
        const email = res.email.toLowerCase();
        if (!patientsMap.has(email)) {
            patientsMap.set(email, {
                id: email,
                name: res.patientName,
                email: email,
                phone: res.phone,
                totalSpent: 0,
                completedVisits: 0,
                cancelledVisits: 0,
                upcomingVisits: 0,
                history: [],
                lastVisitDate: null,
            });
        }

        const patient = patientsMap.get(email);

        patient.history.push({
            id: res.id,
            date: res.date.toISOString(),
            status: res.status,
            serviceName: res.service.name,
            price: res.service.price,
            privateNotes: res.privateNotes,
        });

        if (res.status === 'COMPLETED' || res.status === 'PAID') {
            patient.totalSpent += res.service.price;
        }

        if (res.status === 'COMPLETED') {
            patient.completedVisits += 1;
            if (!patient.lastVisitDate || new Date(res.date) > new Date(patient.lastVisitDate)) {
                patient.lastVisitDate = res.date.toISOString();
            }
        }
        else if (res.status === 'CANCELLED') {
            patient.cancelledVisits += 1;
        }
        else if (res.status === 'PAID' || res.status === 'PENDING') {
            patient.upcomingVisits += 1;
        }
    }
    const patientList = Array.from(patientsMap.values());

    return {
        patientList
    }
}
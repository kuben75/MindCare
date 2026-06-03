import React, {useState} from "react";
import {ReservationStatus, Service} from "@prisma/client";
import {useRouter} from "next/navigation";
import {TReservationWithService} from "@/types/reservation";
import { useToast } from "@/hooks/useToast";

export const useReservationManager = ({ initialReservations, services }: { initialReservations: TReservationWithService[], services: Service[] }) => {

    const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'cancelled'>('upcoming');
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [expandedReservationId, setExpandedReservationId] = useState<string | null>(null);
    const [activeNotesText, setActiveNotesText] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [activeNoteTab, setActiveNoteTab] = useState<'PRIVATE' | 'EMAIL'>('PRIVATE');
    const [emailMessage, setEmailMessage] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);

    const [formData, setFormData] = useState({
        patientName: "",
        email: "",
        phone: "",
        date: "",
        time: "10:00",
        serviceId: services[0]?.id || "",
        status: "PAID" as ReservationStatus
    });

    const router = useRouter();
    const now = new Date();
    const { toast, showToast, hideToast } = useToast();

    const filteredReservations = initialReservations.filter((res) => {
        const resDate = new Date(res.date);
        const matchesSearch =
            res.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.phone.includes(searchQuery);

        if (!matchesSearch) return false;

        if (activeTab === 'upcoming') {
            return res.status !== 'CANCELLED' && resDate >= now;
        }
        if (activeTab === 'history') {
            return res.status !== 'CANCELLED' && (resDate < now || res.status === 'COMPLETED');
        }
        if (activeTab === 'cancelled') {
            return res.status === 'CANCELLED';
        }

        return true;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const combinedDateTime = new Date(`${formData.date}T${formData.time}`);

            const res = await fetch("/api/admin/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientName: formData.patientName,
                    email: formData.email,
                    phone: formData.phone,
                    date: combinedDateTime.toISOString(),
                    serviceId: formData.serviceId,
                    status: formData.status
                })
            });
            if (res.ok) {
                setIsOpenModal(false);
                setFormData({
                    patientName: "",
                    email: "",
                    phone: "",
                    date: "",
                    time: "10:00",
                    serviceId: services[0]?.id || "",
                    status: "PAID"
                });
                showToast("Pomyślnie dodano nową wizytę.", "success");
                router.refresh();
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || "Nie udało się dodać rezerwacji.", "error");
            }
        } catch (e) {
            showToast("Wystąpił błąd podczas dodawania rezerwacji.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveNotes = async (id: string) => {
        setIsSavingNotes(true);
        try {
            const res = await fetch(`/api/admin/reservations/${id}/notes`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateNotes: activeNotesText })
            });

            if (res.ok) {
                router.refresh();
                showToast("Poufne notatki zostały zapisane.", "success");
                setExpandedReservationId(null);
            } else {
                const errorData = await res.json();
                showToast( errorData.message || "Nie udało się zapisać notatek.", "error");
            }
        } catch (e) {
            showToast("Błąd połączenia z serwerem.", "error");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const toggleNotes = (reservation: TReservationWithService) => {
        if (expandedReservationId === reservation.id) {
            setExpandedReservationId(null);
        } else {
            setExpandedReservationId(reservation.id);
            setActiveNotesText(reservation.privateNotes || "");
        }
    };
    const handleToggleDrawer = (reservation: any) => {
        toggleNotes(reservation);
        setActiveNoteTab('PRIVATE');
        setEmailMessage("");
        setEmailSuccess(false);
    };

    const handleSendFollowUp = async (reservationId: string) => {
        if (!emailMessage.trim()) return;
        setIsSendingEmail(true);
        setEmailSuccess(false);

        try {
            const res = await fetch(`/api/admin/reservations/${reservationId}/follow-up`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: emailMessage })
            });

            if (res.ok) {
                setEmailSuccess(true);
                setEmailMessage("");
                showToast("E-mail z podsumowaniem został wysłany.", "success");
                setTimeout(() => setEmailSuccess(false), 3000);
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || "Nie udało się wysłać wiadomości.", "error");
            }
        } catch (error) {
            showToast("Błąd podczas wysyłania e-maila.", "error");
        } finally {
            setIsSendingEmail(false);
        }
    };
    return  {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isOpenModal,
        setIsOpenModal,
        formData,
        setFormData,
        handleSubmit,
        filteredReservations,
        expandedReservationId,
        toggleNotes,
        activeNotesText,
        setActiveNotesText,
        isSavingNotes,
        handleSaveNotes,
        setExpandedReservationId,
        isSubmitting,
        handleToggleDrawer,
        activeNoteTab,
        setActiveNoteTab,
        emailMessage,
        setEmailMessage,
        handleSendFollowUp,
        isSendingEmail,
        emailSuccess, toast, hideToast
    }

}
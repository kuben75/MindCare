import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ReservationStatus } from "@prisma/client";
import { IActionMenuProps } from "@/types/reservation";
import { useToast } from "@/hooks/useToast";

export const useActionMenu = ({ reservationId, currentStatus }: IActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [openDirection, setOpenDirection] = useState<'up' | 'down'>('down');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingDate, setIsSavingDate] = useState(false);
    const [editForm, setEditForm] = useState({ date: "", time: "10:00" });

    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenuDirection = (e: React.MouseEvent) => {
        if(!isOpen) {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if(spaceBelow < 250) {
                setOpenDirection('up');
            } else {
                setOpenDirection('down');
            }
        }
        setIsOpen(!isOpen);
    };

    const updateStatus = async (newStatus: ReservationStatus) => {
        if(newStatus === currentStatus) {
            return setIsOpen(false);
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/reservations/${reservationId}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status: newStatus})
            });
            if (response.ok) {
                setIsOpen(false);
                showToast("Pomyślnie zaktualizowano status.", "success");
                router.refresh();
            } else {
                const errorData = await response.json();
                showToast(errorData.error || 'Nie można zaktualizować statusu rezerwacji.', "error");
            }
        } catch  {
            showToast("Wystąpił błąd połączenia z serwerem.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = () => {
        setIsOpen(false);
        setIsEditModalOpen(true);
    };

    const handleSaveNewDate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingDate(true);
        try {
            const combinedNewDate = new Date (`${editForm.date}T${editForm.time}`).toISOString();
            const res = await fetch(`/api/admin/reservations/new-date/${reservationId}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({date: combinedNewDate})
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                showToast("Termin wizyty został zmieniony.", "success");
                router.refresh();
            } else {
                const errorData = await res.json();
                showToast(errorData.message || errorData.error || 'Nie można zaktualizować daty rezerwacji.', "error");
            }
        } catch  {
            showToast('Wystąpił błąd podczas aktualizacji daty.', "error");
        } finally {
            setIsSavingDate(false);
        }
    };

    return {
        isOpen, isLoading, menuRef, openDirection, toggleMenuDirection,
        updateStatus, isEditModalOpen, handleEditClick, editForm,
        setEditForm, handleSaveNewDate, isSavingDate, setIsEditModalOpen,
        toast, hideToast, mounted
    };
};
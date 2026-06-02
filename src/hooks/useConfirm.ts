import { useContext } from "react";
import { ConfirmContext } from "@/context/ConfirmContext";

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm musi być używany wewnątrz ConfirmProvider");
    }
    return context;
};
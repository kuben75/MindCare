import {useMemo, useState} from "react";
import {IFinancesCardProps} from "@/types/finances";

export const useFinanceClient = ({chartData, currentMonthTransactions}: IFinancesCardProps) => {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [txSearch, setTxSearch] = useState("");

    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
    const currentMonthName = new Date().toLocaleString("pl-PL", { month: "long", year: "numeric" });

    const filteredTx = useMemo(() =>
            currentMonthTransactions.filter(t =>
                t.patientName.toLowerCase().includes(txSearch.toLowerCase()) ||
                t.serviceName.toLowerCase().includes(txSearch.toLowerCase())
            ),
        [currentMonthTransactions, txSearch]
    );

    const exportToCSV = () => {
        if (currentMonthTransactions.length === 0) return;
        const headers = ["ID Rezerwacji", "Data i Godzina", "Pacjent", "Usługa", "Kwota (PLN)", "Status"];
        const rows = currentMonthTransactions.map(t => [
            t.id,
            new Date(t.date).toLocaleString("pl-PL"),
            t.patientName,
            t.serviceName,
            t.price.toString(),
            t.status,
        ]);
        const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
        const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Raport_Finansowy_${currentMonthName.replace(/\s+/g, "_")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return {
        hoveredBar,
        setHoveredBar,
        txSearch,
        setTxSearch,
        filteredTx,
        exportToCSV,
        maxRevenue,
        currentMonthName
    }
}
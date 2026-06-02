export const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric'});
}

export const formatTime = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-Pl', {hour: '2-digit', minute: '2-digit'});
}

export const getStatusBadge = (status: string) => {
    switch(status) {
        case 'PENDING':
            return <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Oczekująca</span>;
        case 'PAID':
            return <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">Opłacona</span>;
        case 'COMPLETED':
            return <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Zakończona</span>;
        case 'CANCELLED':
            return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Anulowana</span>;
        default:
            return <span className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-700 text-zinc-300">{status}</span>;
    }
};


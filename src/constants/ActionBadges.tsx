import {ReservationStatus} from "@prisma/client";

export const getActionBadge = (action: string) => {
    switch (action) {
        case 'LOGIN_SUCCESS':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Zalogowano </span>;
        case 'FAILED_LOGIN':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Błędne hasło </span>;
        case 'BLOCKED_LOGIN_ATTEMPT':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Atak Zablokowany </span>;
        default:
            return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
                    {action} </span>;
    }
};

export const STATUS_BADGE: Record<ReservationStatus, { bg: string, text: string, dot: string, label: string, border?: string }> = {
    PAID: { bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Opłacona', border: 'border-emerald-200/50 dark:border-emerald-500/30' },
    PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/50', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Brak wpłaty', border: 'border-amber-200/50 dark:border-amber-500/30' },
    COMPLETED: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', label: 'Zakończona', border: 'border-blue-200/50 dark:border-blue-500/30' },
    CANCELLED: { bg: 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/50', text: 'text-zinc-500 dark:text-zinc-400', dot: 'bg-zinc-400', label: 'Odwołana', border: 'border-zinc-200/50 dark:border-zinc-700/50' },
};
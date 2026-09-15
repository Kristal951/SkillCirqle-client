'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/lib/toast';
import {
    ArrowUpDown,
    Check,
    Copy,
    Download,
    Inbox,
    Loader2,
    Search,
    Trash2,
} from 'lucide-react';
import ConfirmModal from './confirmModal';

interface Signup {
    id: string;
    email: string;
    created_at: string;
}

interface Cursor {
    createdAt: string;
    id: string;
}

function csvEscape(value: string) {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function formatCsvDate(dateStr: string) {
    const date = new Date(dateStr);

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
}

function toCsv(rows: { email: string; created_at: string }[]) {
    return [
        'email - signed_up_at',
        ...rows.map(
            s =>
                `${csvEscape(s.email)} - ${formatCsvDate(s.created_at)}`
        ),
    ].join('\n');
}

function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

export default function WaitlistTable({
    initialRows,
    initialHasMore,
}: {
    initialRows: Signup[];
    initialHasMore: boolean;
}) {
    const [rows, setRows] = useState<Signup[]>(initialRows);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [cursorStack, setCursorStack] = useState<Cursor[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [pendingDelete, setPendingDelete] = useState<{
        id: string;
        email: string;
    } | null>(null);

    const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

    const fetchPage = useCallback(
        async (
            cursor: Cursor | null,
            searchTerm: string,
            order: 'asc' | 'desc'
        ) => {
            setLoading(true);

            try {
                const params = new URLSearchParams();

                if (searchTerm) {
                    params.set('search', searchTerm);
                }

                params.set('sort', order);

                if (cursor) {
                    params.set('cursorCreatedAt', cursor.createdAt);
                    params.set('cursorId', cursor.id);
                }

                const res = await fetch(
                    `/api/admin/waitlist?${params.toString()}`
                );

                if (!res.ok) {
                    toast.error('Failed to load waitlist');
                    return;
                }

                const data = await res.json();

                setRows(data.rows);
                setHasMore(data.hasMore);
                setSelected(new Set());
            } finally {
                setLoading(false);
            }
        },
        []
    );

    function formatSignupTime(dateStr: string) {
        const date = new Date(dateStr);
        const now = new Date();

        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // Future dates
        if (diffMins < 0) {
            const absMins = Math.abs(diffMins);

            if (absMins < 60) {
                return `in ${absMins}m`;
            }

            const hours = Math.floor(absMins / 60);

            if (hours < 24) {
                return `in ${hours}hr`;
            }

            return date.toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        }

        // Recent activity
        if (diffMins < 1) {
            return 'Just now';
        }

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        }

        const diffHours = Math.floor(diffMins / 60);

        if (diffHours < 24) {
            return `${diffHours}hr ago`;
        }

        // Compare calendar dates
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const signupDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        const diffDays = Math.floor(
            (today.getTime() - signupDay.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const time = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        if (diffDays === 1) {
            return `Yesterday, ${time}`;
        }

        if (diffDays === 0) {
            return `Today, ${time}`;
        }

        return `${date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })}, ${time}`;
    }

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setCursorStack([]);
            fetchPage(null, search, sortOrder);
        }, 350);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search, sortOrder, fetchPage]);

    const handleNext = () => {
        if (!hasMore || rows.length === 0) return;

        const last = rows[rows.length - 1];

        setCursorStack(prev => [
            ...prev,
            {
                createdAt: last.created_at,
                id: last.id,
            },
        ]);

        fetchPage(
            {
                createdAt: last.created_at,
                id: last.id,
            },
            search,
            sortOrder
        );
    };

    const handlePrevious = () => {
        if (cursorStack.length === 0) return;

        const newStack = cursorStack.slice(0, -1);

        setCursorStack(newStack);

        const prevCursor =
            newStack.length > 0
                ? newStack[newStack.length - 1]
                : null;

        fetchPage(prevCursor, search, sortOrder);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const allOnPageSelected =
        rows.length > 0 &&
        rows.every(signup => selected.has(signup.id));

    const toggleSelectAllOnPage = () => {
        setSelected(prev => {
            const next = new Set(prev);

            if (allOnPageSelected) {
                rows.forEach(signup => next.delete(signup.id));
            } else {
                rows.forEach(signup => next.add(signup.id));
            }

            return next;
        });
    };

    const handleCopy = (id: string, email: string) => {
        navigator.clipboard.writeText(email);

        setCopiedId(id);

        toast.success('Email copied');

        setTimeout(() => {
            setCopiedId(prev => (prev === id ? null : prev));
        }, 1500);
    };

    const requestDelete = (id: string, email: string) => {
        setPendingDelete({
            id,
            email,
        });
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;

        const { id } = pendingDelete;

        setDeletingIds(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });

        try {
            const res = await fetch(
                `/api/admin/waitlist/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (!res.ok) {
                toast.error('Failed to remove signup');
                return;
            }

            setRows(prev =>
                prev.filter(signup => signup.id !== id)
            );

            setSelected(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });

            toast.success('Removed from waitlist');
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });

            setPendingDelete(null);
        }
    };

    const requestBulkDelete = () => {
        if (selected.size === 0) return;

        setPendingBulkDelete(true);
    };

    const confirmBulkDelete = async () => {
        setBulkDeleting(true);

        const ids = Array.from(selected);

        try {
            const results = await Promise.allSettled(
                ids.map(id =>
                    fetch(`/api/admin/waitlist/${id}`, {
                        method: 'DELETE',
                    })
                )
            );

            const failedIds = ids.filter((_, index) => {
                const result = results[index];

                return (
                    result.status === 'rejected' ||
                    (result.status === 'fulfilled' &&
                        !result.value.ok)
                );
            });

            const succeededIds = new Set(
                ids.filter(id => !failedIds.includes(id))
            );

            setRows(prev =>
                prev.filter(
                    signup => !succeededIds.has(signup.id)
                )
            );

            setSelected(prev => {
                const next = new Set(prev);

                succeededIds.forEach(id => next.delete(id));

                return next;
            });

            if (failedIds.length > 0) {
                toast.error(
                    `Removed ${succeededIds.size}, failed to remove ${failedIds.length}`
                );
            } else {
                toast.success(
                    `Removed ${succeededIds.size} signup${succeededIds.size > 1 ? 's' : ''
                    }`
                );
            }
        } finally {
            setBulkDeleting(false);
            setPendingBulkDelete(false);
        }
    };

    const handleExportAll = async () => {
        const params = new URLSearchParams();

        if (search) {
            params.set('search', search);
        }

        const res = await fetch(
            `/api/admin/waitlist/export?${params.toString()}`
        );

        if (!res.ok) {
            toast.error('Export failed');
            return;
        }

        const data = await res.json();

        downloadCsv(
            toCsv(data.rows),
            `waitlist-export-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`
        );
    };

    const handleExportSelected = () => {
        const selectedRows = rows.filter(signup =>
            selected.has(signup.id)
        );

        downloadCsv(
            toCsv(selectedRows),
            `waitlist-selected-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`
        );
    };

    const currentPage =
        cursorStack.length > 0
            ? cursorStack.length + 1
            : 1;

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface/30 shadow-sm">
                <div className="border-b border-border/50 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/70"
                            />

                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={search}
                                onChange={e =>
                                    setSearch(e.target.value)
                                }
                                className="
                                    h-10 w-full
                                    rounded-xl
                                    border border-border/60
                                    bg-background/40
                                    pl-10 pr-4
                                    text-sm
                                    text-text-primary
                                    placeholder:text-text-secondary/50
                                    outline-none
                                    transition-all
                                    focus:border-primary/50
                                    focus:bg-background/70
                                    focus:ring-2
                                    focus:ring-primary/10
                                "
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="
                                        absolute right-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-xs
                                        text-text-secondary
                                        transition
                                        hover:text-text-primary
                                    "
                                    aria-label="Clear search"
                                >
                                    Esc
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">

                            {selected.size > 0 && (
                                <div className="flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/6 p-1">

                                    <span className="px-2 text-xs font-medium text-primary">
                                        {selected.size} selected
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleExportSelected}
                                        className="
                                            flex items-center gap-1.5
                                            rounded-lg
                                            px-2.5 py-1.5
                                            text-xs font-medium
                                            text-text-secondary
                                            transition
                                            hover:bg-white/5
                                            hover:text-text-primary
                                        "
                                    >
                                        <Download size={13} />
                                        Export
                                    </button>

                                    <button
                                        type="button"
                                        onClick={requestBulkDelete}
                                        disabled={bulkDeleting}
                                        className="
                                            flex items-center gap-1.5
                                            rounded-lg
                                            px-2.5 py-1.5
                                            text-xs font-medium
                                            text-red-400
                                            transition
                                            hover:bg-red-400/10
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        {bulkDeleting ? (
                                            <Loader2
                                                size={13}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={13} />
                                        )}

                                        Remove
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    setSortOrder(prev =>
                                        prev === 'desc'
                                            ? 'asc'
                                            : 'desc'
                                    )
                                }
                                className="
                                    flex h-10
                                    items-center gap-1.5
                                    rounded-xl
                                    border border-border/60
                                    bg-background/30
                                    px-3
                                    text-xs font-medium
                                    text-text-secondary
                                    transition-all
                                    hover:bg-white/5
                                    hover:text-text-primary
                                "
                            >
                                <ArrowUpDown size={14} />

                                <span className="hidden sm:inline">
                                    {sortOrder === 'desc'
                                        ? 'Newest first'
                                        : 'Oldest first'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleExportAll}
                                className="
                                    flex h-10
                                    items-center gap-1.5
                                    rounded-xl
                                    bg-primary
                                    px-3.5
                                    text-xs font-semibold
                                    text-white
                                    shadow-sm
                                    shadow-primary/20
                                    transition-all
                                    hover:opacity-90
                                    active:scale-[0.98]
                                "
                            >
                                <Download size={14} />
                                <span>Export all</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-x-auto">

                    {loading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/55 backdrop-blur-[2px]">
                            <div className="
                                flex items-center gap-2.5
                                rounded-xl
                                border border-border/60
                                bg-surface
                                px-3.5 py-2.5
                                text-xs
                                text-text-secondary
                                shadow-xl
                            ">
                                <Loader2
                                    size={15}
                                    className="animate-spin text-primary"
                                />

                                Loading waitlist...
                            </div>
                        </div>
                    )}

                    <table className="w-full min-w-170 text-left text-sm">

                        <thead>
                            <tr className="border-b border-border/50 bg-surface/40">

                                <th className="w-12 px-4 py-3.5">
                                    <input
                                        type="checkbox"
                                        checked={allOnPageSelected}
                                        onChange={
                                            toggleSelectAllOnPage
                                        }
                                        aria-label="Select all signups on this page"
                                        className="
                                            h-4 w-4
                                            cursor-pointer
                                            rounded
                                            border-border
                                            accent-primary
                                        "
                                    />
                                </th>

                                <th className="px-4 py-3.5">
                                    <span className="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.08em]
                                        text-text-secondary
                                    ">
                                        Email
                                    </span>
                                </th>

                                <th className="px-4 py-3.5">
                                    <span className="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.08em]
                                        text-text-secondary
                                    ">
                                        Signed up
                                    </span>
                                </th>

                                <th className="px-4 py-3.5 text-right">
                                    <span className="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.08em]
                                        text-text-secondary
                                    ">
                                        Actions
                                    </span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map(signup => {
                                const isDeleting =
                                    deletingIds.has(signup.id);

                                const isSelected =
                                    selected.has(signup.id);

                                return (
                                    <tr
                                        key={signup.id}
                                        className={`
                                            border-b border-border/30
                                            transition-colors
                                            last:border-b-0
                                            ${isSelected
                                                ? 'bg-primary/[0.035]'
                                                : 'hover:bg-white/2.5'
                                            }
                                        `}
                                    >
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    toggleSelect(
                                                        signup.id
                                                    )
                                                }
                                                aria-label={`Select ${signup.email}`}
                                                className="
                                                    h-4 w-4
                                                    cursor-pointer
                                                    rounded
                                                    border-border
                                                    accent-primary
                                                "
                                            />
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">

                                                <div className="
                                                    flex h-9 w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-primary/10
                                                    bg-primary
                                                    text-lg
                                                    font-semibold
                                                    uppercase
                                                    text-text-primary
                                                ">
                                                    {signup.email
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="
                                                        truncate
                                                        font-medium
                                                        text-text-primary
                                                    ">
                                                        {signup.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="text-sm font-medium text-text-secondary">
                                                {formatSignupTime(signup.created_at)}
                                            </span>
                                        </td>


                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCopy(
                                                            signup.id,
                                                            signup.email
                                                        )
                                                    }
                                                    title="Copy email"
                                                    aria-label="Copy email"
                                                    className="
                                                        flex h-8 w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        text-text-secondary
                                                        transition-all
                                                        hover:bg-white/5
                                                        hover:text-text-primary
                                                    "
                                                >
                                                    {copiedId ===
                                                        signup.id ? (
                                                        <Check
                                                            size={15}
                                                            className="text-emerald-400"
                                                        />
                                                    ) : (
                                                        <Copy
                                                            size={15}
                                                        />
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        requestDelete(
                                                            signup.id,
                                                            signup.email
                                                        )
                                                    }
                                                    disabled={
                                                        isDeleting
                                                    }
                                                    title="Remove from waitlist"
                                                    aria-label="Remove from waitlist"
                                                    className="
                                                        flex h-8 w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        text-text-secondary
                                                        transition-all
                                                        hover:bg-red-400/10
                                                        hover:text-red-400
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                                                >
                                                    {isDeleting ? (
                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2
                                                            size={15}
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {rows.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-16"
                                    >
                                        <div className="
                                            mx-auto
                                            flex
                                            max-w-sm
                                            flex-col
                                            items-center
                                            text-center
                                        ">
                                            <div className="
                                                mb-4
                                                flex h-12 w-12
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                border
                                                border-border/50
                                                bg-white/3
                                            ">
                                                <Inbox
                                                    size={21}
                                                    className="
                                                        text-text-secondary/60
                                                    "
                                                />
                                            </div>

                                            <p className="
                                                text-sm
                                                font-semibold
                                                text-text-primary
                                            ">
                                                No signups found
                                            </p>

                                            <p className="
                                                mt-1.5
                                                text-xs
                                                leading-5
                                                text-text-secondary
                                            ">
                                                {search
                                                    ? 'Try searching with a different email address.'
                                                    : 'New waitlist signups will appear here.'}
                                            </p>

                                            {search && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSearch('')
                                                    }
                                                    className="
                                                        mt-4
                                                        rounded-lg
                                                        border
                                                        border-border/60
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-medium
                                                        text-text-secondary
                                                        transition
                                                        hover:bg-white/5
                                                        hover:text-text-primary
                                                    "
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="
                    flex
                    flex-col
                    gap-3
                    border-t
                    border-border/50
                    px-4
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">
                    <div className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-text-secondary
                    ">
                        <span>
                            Page{' '}
                            <span className="font-medium text-text-primary">
                                {currentPage}
                            </span>
                        </span>

                        {search && (
                            <>
                                <span className="text-border">
                                    /
                                </span>

                                <span>
                                    Search results
                                </span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={
                                cursorStack.length === 0 ||
                                loading
                            }
                            className="
                                rounded-lg
                                border
                                border-border/60
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-text-secondary
                                transition
                                hover:bg-white/5
                                hover:text-text-primary
                                disabled:pointer-events-none
                                disabled:opacity-35
                            "
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!hasMore || loading}
                            className="
                                rounded-lg
                                border
                                border-border/60
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-text-secondary
                                transition
                                hover:bg-white/5
                                hover:text-text-primary
                                disabled:pointer-events-none
                                disabled:opacity-35
                            "
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={!!pendingDelete}
                title="Remove from waitlist"
                description={
                    pendingDelete
                        ? `Remove ${pendingDelete.email} from the waitlist? This can't be undone.`
                        : ''
                }
                isLoading={
                    pendingDelete
                        ? deletingIds.has(
                            pendingDelete.id
                        )
                        : false
                }
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />

            <ConfirmModal
                open={pendingBulkDelete}
                title="Remove selected signups"
                description={`Remove ${selected.size} signup${selected.size > 1 ? 's' : ''
                    } from the waitlist? This can't be undone.`}
                confirmLabel={`Remove ${selected.size}`}
                isLoading={bulkDeleting}
                onConfirm={confirmBulkDelete}
                onCancel={() =>
                    setPendingBulkDelete(false)
                }
            />
        </>
    );
}


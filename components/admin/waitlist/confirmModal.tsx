// components/ui/ConfirmModal.tsx
'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = 'Remove',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={onCancel}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-400/10">
                            <AlertTriangle size={18} className="text-red-400" />
                        </div>
                        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-text-secondary hover:text-text-primary"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="mt-3 text-sm text-text-secondary">{description}</p>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-white/5 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
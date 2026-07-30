"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { ConfirmationActionType } from "@/types/Admin";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    actionType: ConfirmationActionType,
    feedbackNote?: string,
  ) => Promise<void>;
  actionType: ConfirmationActionType | null;
  userName: string;
  skillName: string;
  rejectionReason: string;
  setRejectionReason: React.Dispatch<React.SetStateAction<string>>;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  userName,
  skillName,
  setRejectionReason,
  rejectionReason,
}) => {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRejectionReason("");
      setSubmitting(false);
    }
  }, [isOpen, setRejectionReason]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  if (!isOpen || !actionType) return null;

  const isApprove = actionType === "APPROVED";

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await onConfirm(
        actionType,
        isApprove ? undefined : rejectionReason.trim(),
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = isApprove || rejectionReason.trim().length > 0;

  return (
    <div
      onClick={() => !submitting && onClose()}
      className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border/80 rounded-3xl w-full max-w-md p-6 relative shadow-2xl transition-all scale-100"
      >
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:bg-background hover:text-text-primary transition-all disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div
            className={`p-3.5 rounded-full mb-4 ${
              isApprove
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {isApprove ? (
              <CheckCircle2 size={32} className="stroke-[1.75]" />
            ) : (
              <AlertTriangle size={32} className="stroke-[1.75]" />
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            {isApprove ? "Approve Verification" : "Reject Verification"}
          </h2>

          <p className="text-sm text-text-secondary mt-1.5 max-w-70 leading-relaxed">
            You are about to{" "}
            {isApprove ? (
              <span className="text-green-500 uppercase font-semibold tracking-wide">
                Approve
              </span>
            ) : (
              <span className="text-red-500 uppercase font-semibold tracking-wide">
                Reject
              </span>
            )}{" "}
            the
            <span className="text-text-primary uppercase font-bold">
              {" "}
              {skillName}{" "}
            </span>{" "}
            skill claim submitted by{" "}
            <span className="text-text-primary uppercase font-bold">
              {userName}
            </span>
          </p>
        </div>

        {!isApprove && (
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Reason for rejection *</span>
              <span>{rejectionReason.length}/500</span>
            </div>
            <textarea
              value={rejectionReason}
              maxLength={500}
              disabled={submitting}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., The provided link does not lead to a valid certification file, please submit a clear PDF proof instead."
              rows={3}
              className="w-full bg-background/50 border border-border/80 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 py-3 px-4 outline-none rounded-2xl transition-all resize-none text-sm placeholder:text-text-secondary/55 text-text-primary"
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleConfirmSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3.5 text-text-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg ${
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10"
                : "bg-red-600 hover:bg-red-500 shadow-red-500/10"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm ${isApprove ? "Approval" : "Rejection"}`
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full py-3 text-text-secondary hover:text-text-primary rounded-2xl text-sm font-semibold transition-colors disabled:opacity-30"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

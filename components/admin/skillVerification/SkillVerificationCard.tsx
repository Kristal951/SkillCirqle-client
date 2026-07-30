"use client";

import { ConfirmationActionType, SkillVerification } from "@/types/Admin";
import {
  Check,
  ExternalLink,
  FileText,
  Link2,
  MessageSquare,
  MoreVerticalIcon,
  X,
} from "lucide-react";
import React, { useEffect } from "react";
import StatusBadge from "./StatusBadge";
import { getFreshSignedUrl } from "@/utils/getFreshSignedUrl";

interface SkillVerificationCardProps {
  sv: SkillVerification;
  actioningId: string | null;
  buttonOnClick: (
    verification: SkillVerification,
    action: ConfirmationActionType,
  ) => void;
  onConfirm: (
    action: ConfirmationActionType,
    feedbackNote?: string,
  ) => Promise<void>;
  loading?: boolean;
  resolvedProofUrl?: string | null;
  proofUrlLoading?: boolean;
}

export const SkillVerificationCardSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-text-secondary/10 shrink-0" />
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="h-3.5 bg-text-secondary/15 rounded-md w-24" />
          <div className="h-3 bg-text-secondary/10 rounded-md w-32" />
        </div>
      </div>
    </td>

    <td className="py-4 px-6">
      <div className="h-4 bg-text-secondary/15 rounded-md w-16" />
    </td>

    <td className="py-4 px-6">
      <div className="h-3.5 bg-text-secondary/15 rounded-md w-28" />
    </td>

    <td className="py-4 px-6 max-w-50">
      <div className="h-3.5 bg-text-secondary/10 rounded-md w-36" />
    </td>

    <td className="py-4 px-6">
      <div className="h-5 bg-text-secondary/15 rounded-full w-16" />
    </td>

    <td className="py-4 px-6 text-right">
      <div className="flex items-center justify-end gap-2">
        <div className="w-7 h-7 bg-text-secondary/10 rounded-lg" />
        <div className="w-7 h-7 bg-text-secondary/10 rounded-lg" />
      </div>
    </td>
  </tr>
);

const SkillVerificationCard = ({
  sv,
  actioningId,
  buttonOnClick,
  loading,
  resolvedProofUrl,
  proofUrlLoading,
}: SkillVerificationCardProps) => {
  if (loading) {
    return <SkillVerificationCardSkeleton />;
  }

  return (
    <>
      <tr className="hover:bg-background/20 transition-colors group">
        <td className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-border/40 flex items-center justify-center font-bold text-primary shrink-0 overflow-hidden">
              {sv.user?.avatar ? (
                <img
                  src={sv.user.avatar}
                  alt={sv.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                sv.user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-text-primary truncate">
                {sv.user?.name}
              </span>
              <span className="text-xs text-text-secondary truncate">
                {sv.user?.email}
              </span>
            </div>
          </div>
        </td>

        <td className="py-4 px-6">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-text-primary">
            {sv?.skill?.name}
          </span>
        </td>

        <td className="py-4 px-6">
          {sv.proof_type === "link" ? (
            sv.proof_url ? (
              <a
                href={sv.proof_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline hover:text-primary-hover group"
              >
                <Link2
                  size={14}
                  className="group-hover:scale-110 transition-transform"
                />
                Go to Link
                <ExternalLink size={12} className="opacity-70" />
              </a>
            ) : (
              <span className="text-xs text-text-secondary/40 italic">
                No proof provided
              </span>
            )
          ) : proofUrlLoading ? (
            <span className="text-xs text-text-secondary/40 italic">
              Loading document…
            </span>
          ) : resolvedProofUrl ? (
            <a
              href={resolvedProofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline hover:text-primary-hover group"
            >
              <FileText
                size={14}
                className="group-hover:scale-110 transition-transform"
              />
              View Document
              <ExternalLink size={12} className="opacity-70" />
            </a>
          ) : (
            <span className="text-xs text-text-secondary/40 italic">
              {sv.proof_url ? "Failed to load document" : "No proof provided"}
            </span>
          )}
        </td>

        {/* <td className="py-4 px-6 max-w-50">
          {sv.note ? (
            <div className="flex items-start gap-1.5 text-xs text-text-secondary group-hover:text-text-primary transition-colors">
              <MessageSquare size={14} className="shrink-0 mt-0.5 opacity-60" />
              <span className="line-clamp-2" title={sv.note}>
                {sv.note}
              </span>
            </div>
          ) : (
            <span className="text-xs text-text-secondary/40 italic">
              No notes added
            </span>
          )}
        </td> */}

        <td className="py-4 px-6">
          <StatusBadge status={sv.status} />
        </td>

        <td className="py-4 px-6 text-right">
          {sv.status === "PENDING" ? (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => buttonOnClick(sv, "APPROVED")}
                disabled={actioningId === sv.id}
                className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-lg transition-all disabled:opacity-50"
                title="Approve verification"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => buttonOnClick(sv, "REJECTED")}
                disabled={actioningId === sv.id}
                className="p-1.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all disabled:opacity-50"
                title="Reject verification"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button className="hover:bg-text-secondary/20 p-2 rounded-lg">
              <MoreVerticalIcon size={20} className="text-text-secondary" />
            </button>
          )}
        </td>
      </tr>
    </>
  );
};

export default SkillVerificationCard;

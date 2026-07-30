import { SkillVerificationStatus } from "@/types/Admin";
import { Check, Clock, X } from "lucide-react";
import React from "react";

type StatusBadgeProps = {
  status: SkillVerificationStatus;
};

const StatusBadge = ({ status } : StatusBadgeProps) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-600">
          <Clock size={12} className="animate-pulse" />
          Pending
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-600">
          <Check size={12} />
          Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-semibold text-red-600">
          <X size={12} />
          Rejected
        </span>
      );
    default:
      return null;
  }
};

export default StatusBadge;

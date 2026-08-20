"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EngagementType, Proposal, ProposalStatus } from "@/types/Proposal";
import { Check, X } from "lucide-react";
import { ProposalView } from "@/app/(protected)/proposals/page";
import { useProposalStore } from "@/store/useProposalStore";
import Spinner from "../ui/Spinner";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import SwapHoriz from "@material-symbols/svg-400/outlined/swap_horiz.svg";
import Psychology from "@material-symbols/svg-400/outlined/psychology.svg";
import HourGlassEmpty from "@material-symbols/svg-400/outlined/hourglass_empty.svg";
import Calendar_today from "@material-symbols/svg-400/outlined/calendar_today.svg";
import Workspaces from "@material-symbols/svg-400/outlined/workspaces.svg";
import { IconType } from "@/utils/SvgType";

type Props = {
  p: ProposalView;
  now: number;
  statusStyles: Record<ProposalStatus, string>;
};

const INSUFFICIENT_SKILL_CREDITS_CODE = "SC001";

const ProposalCard = ({ p, statusStyles, now }: Props) => {
  const { updateProposalStatus, updatingStatus } = useProposalStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const typeConfig: Record<EngagementType, { icon: IconType; label: string }> =
    {
      learn: {
        icon: Psychology,
        label: "Learn",
      },
      swap: {
        icon: SwapHoriz,
        label: "Skill Swap",
      },
    };

  const type = typeConfig[p.type] ?? typeConfig["swap"];

  const formattedDate = React.useMemo(
    () =>
      formatDistanceToNow(new Date(p.dateCreated), {
        addSuffix: true,
      }),
    [p.dateCreated, now],
  );
  const firstName = p.partnerName?.trim().split(/\s+/)[0] || "User";
  const senderName = user?.name || "";
  const senderImage = user?.avatar_url || "";
  const link = "/proposals";

  const acceptProposal = async () => {
    if (p?.isSender) {
      return;
    }

    try {
      const proposalId = p?.id;
      await updateProposalStatus(
        proposalId,
        "accepted" as ProposalStatus,
        senderName,
        senderImage,
        link,
      );
    } catch (err: any) {
      if (err?.code === INSUFFICIENT_SKILL_CREDITS_CODE) {
        toast.error(
          "Not enough SkillCredits",
          `${firstName} doesn't have enough SkillCredits to accept this yet.`,
        );
      } else {
        toast.error("Failed to accept proposal.", "please try again later.");
      }
      console.error(err);
    }
  };

  const declineProposal = async () => {
    if (p?.isSender) {
      return;
    }

    try {
      const proposalId = p?.id;
      await updateProposalStatus(
        proposalId,
        "declined" as ProposalStatus,
        senderName,
        senderImage,
        link,
      );
    } catch (err) {
      toast.error("Failed to decline proposal");
      console.error(err);
    }
  };

  const handleGotoWorkspace = () => {
    if (!p.workspaceId) {
      toast.error("Workspace not found", "please try again in a moment.");
      return;
    }
    router.push(`/workspace/${p.workspaceId}`);
  };

  const Icon = type.icon;
  const TeachIcon = p.skillToTeachIcon;
  const LearnIcon = p.skillToLearnIcon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 sm:p-6 bg-surface/50 rounded-2xl border border-border hover:border-primary/30 transition-all shadow-sm"
    >
      <div className="flex justify-between items-start mb-6 gap-2">
        <div className="flex gap-3 sm:gap-4 items-center">
          <img
            src={p.partnerImage || "/default-avatar.png"}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-background"
            alt="avatar"
          />

          <div className="flex flex-col gap-1">
            <h2 className="text-base sm:text-lg font-bold truncate max-w-30 sm:max-w-none">
              {p.partnerName}
            </h2>
            <div className="flex gap-2">
              <div className="flex bg-accent/20 items-center px-2 py-1 border border-accent/20 justify-center rounded gap-1 text-xs text-accent">
                <Icon />
                <p className="text-[9px] font-headline font-bold uppercase tracking-widest">
                  {type?.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`px-2 sm:px-3 py-1 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
            statusStyles[p.status] ?? statusStyles.pending
          }`}
        >
          {p.status}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full flex-1 bg-background/50 border border-border p-4 rounded-xl">
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-2">
              {!p.isSender ? ` wants to learn` : "I want to learn"}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-primary text-xl">
                <TeachIcon />
              </span>
              <span className="font-semibold text-sm truncate">{p.iLearn ?? p?.iTeach}</span>
            </div>
          </div>

          {p.type === "swap" && (
            <>
              <SwapHoriz className="text-lg text-text-secondary rotate-90 md:rotate-none" />

              <div className="w-full flex-1 bg-background/50 border border-border p-4 rounded-xl">
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-2">
                  {!p.isSender
                    ? `${firstName} will teach you`
                    : "I will teach you"}
                </p>

                <div className="flex items-center gap-3">
                  <span className="text-accent text-xl">
                    <LearnIcon />
                  </span>
                  <span className="font-semibold text-sm truncate">
                    {p.iTeach}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* <div className="py-3">
          <p className="text-xs text-text-secondary">{p?.message}</p>
        </div> */}
      </div>

      <div className="flex flex-row items-center justify-between pt-6  gap-4">
        <div className="flex justify-between w-full sm:w-auto sm:gap-6">
          <div className="flex items-center gap-2 text-text-secondary">
            <Calendar_today className="text-base text-accent" />

            <p className="text-[10px] sm:text-xs font-medium text-accent">
              {formattedDate}
            </p>
          </div>
        </div>

        {!p.isSender && p.status === "pending" && (
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              disabled={updatingStatus}
              onClick={declineProposal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={14} />
              <span>Decline</span>
            </button>

            <button
              onClick={acceptProposal}
              disabled={updatingStatus}
              className="relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 disabled:bg-primary/70 disabled:cursor-not-allowed min-w-25"
            >
              <AnimatePresence mode="wait">
                {updatingStatus ? (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Spinner size={16} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={14} />
                    <span>Accept</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}

        {p.isSender && p.status === "pending" && (
          <div className="flex">
            <button className="w-full border border-border text-on-surface-variant font-headline font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-text-secondary cursor-not-allowed">
              <HourGlassEmpty className="text-base" />
              Waiting for Response
            </button>
          </div>
        )}

        {p.status === "accepted" && (
          <div className="flex">
            <button
              onClick={handleGotoWorkspace}
              className="w-max bg-primary text-text-primary font-headline font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Workspaces className="text-base" />
              <p>Go to Workspace</p>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProposalCard;
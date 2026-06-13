"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EngagementType, Proposal, ProposalStatus } from "@/types/Proposal";
import { Check, X } from "lucide-react";
import { ProposalView } from "@/app/(protected)/proposals/page";
import { useProposalStore } from "@/store/useProposalStore";
import Spinner from "../ui/Spinner";
import { toast } from "@/lib/toast";
import { getOrCreateConversation } from "@/utils/getOrCreateConversation";
import { useAuthStore } from "@/store/useAuthStore";
import { getConversationById } from "@/utils/getConversationDetails";
import { formatDistanceToNow } from "date-fns";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "next/navigation";

type Props = {
  p: ProposalView;
  now: number;
  statusStyles: Record<ProposalStatus, string>;
};

const ProposalCard = ({ p, statusStyles }: Props) => {
  const { updateProposalStatus, updatingStatus } = useProposalStore();
  const { user } = useAuthStore();
  const { setActiveChat } = useChatStore();
  const userId = user?.id || "";
  const router = useRouter();

  // const formatConfig: Record<SessionFormat, { icon: string; label: string }> = {
  //   "one-on-one": {
  //     icon: "person",
  //     label: "One-on-One",
  //   },
  //   group: {
  //     icon: "groups",
  //     label: "Group Session",
  //   },
  // };

  const typeConfig: Record<EngagementType, { icon: string; label: string }> = {
    learn: {
      icon: "psychology",
      label: "MentorShip",
    },
    swap: {
      icon: "swap_horiz",
      label: "Skill Swap",
    },
  };

  // const format = formatConfig[p.format] ?? formatConfig["one-on-one"];
  const type = typeConfig[p.type] ?? typeConfig["swap"];

  const formattedDate = React.useMemo(
    () =>
      formatDistanceToNow(new Date(p.dateCreated), {
        addSuffix: true,
      }),
    [p.dateCreated],
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
        "active" as ProposalStatus,
        senderName,
        senderImage,
        link,
      );
    } catch (err) {
      toast.error(
        "Failed to accept proposal",
        `We'll let ${firstName} know about this.`,
      );
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
        "rejected" as ProposalStatus,
        senderName,
        senderImage,
        link,
      );
    } catch (err) {
      toast.error("Failed to decline proposal");
      console.error(err);
    }
  };

  const handleGotoChat = async () => {
    try {
      const userA = p.senderID;
      const userB = p.receiverID;

      const convID = await getOrCreateConversation(userA, userB);

      const conv = await getConversationById(convID, userId);
      setActiveChat(conv);
      router.push(`/chat/`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to open chat");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 sm:p-6 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-all shadow-sm"
    >
      <div className="flex justify-between items-start mb-6 gap-2">
        <div className="flex gap-3 sm:gap-4 items-center">
          <img
            src={p.partnerImage || "/default-avatar.png"}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover ring-2 ring-background"
            alt="avatar"
          />

          <div className="flex flex-col gap-1">
            <h2 className="text-base sm:text-lg font-bold truncate max-w-30 sm:max-w-none">
              {p.partnerName}
            </h2>
            <div className="flex gap-2">
              <div className="flex bg-primary/20 items-center px-2 py-1 border border-border justify-center rounded gap-1 text-xs text-text-primary">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontSize: "12px" }}
                >
                  person
                </span>
                <p className="text-[9px] font-headline font-bold uppercase tracking-widest">
                  One-on-One
                </p>
              </div>

              <div className="flex bg-accent/20 items-center px-2 py-1 border border-accent/20 justify-center rounded gap-1 text-xs text-accent">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontSize: "12px" }}
                >
                  {type?.icon}
                </span>
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
              {!p.isSender ? `${firstName} wants to learn` : "I want to learn"}
            </p>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                {p.skillToTeachIcon}
              </span>
              <span className="font-semibold text-sm truncate">{p.iLearn}</span>
            </div>
          </div>

          {p.type === "swap" && (
            <>
              <span className="material-symbols-outlined rotate-90 md:rotate-none">
                swap_horiz
              </span>

              <div className="w-full flex-1 bg-background/50 border border-border p-4 rounded-xl">
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-2">
                  {!p.isSender
                    ? `${firstName} will teach you`
                    : "I will teach you"}
                </p>

                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent">
                    {p.skillToLearnIcon}
                  </span>
                  <span className="font-semibold text-sm truncate">
                    {p.iTeach}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="py-3">
          <p className="text-xs text-text-secondary">{p?.message}</p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between pt-6 border-t border-border gap-4">
        <div className="flex justify-between w-full sm:w-auto sm:gap-6">
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="material-symbols-outlined text-base text-accent">
              calendar_today
            </span>
            <p className="text-[10px] sm:text-xs font-medium text-accent">
              {formattedDate}
            </p>
          </div>
        </div>

        {!p.isSender && p.status === "pending" && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              disabled={updatingStatus}
              onClick={declineProposal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <X size={14} />
                    <span>Decline</span>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <span
                className="material-symbols-outlined text-base"
                data-icon="hourglass_empty"
              >
                hourglass_empty
              </span>
              Waiting for Response
            </button>
          </div>
        )}

        {p.status === "active" && (
          <div className="flex">
            <button
              onClick={handleGotoChat}
              className="w-max bg-primary text-text-primary font-headline font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-base"
                data-icon="hourglass_empty"
              >
                chat
              </span>
              <p>{` Message ${firstName}`}</p>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProposalCard;

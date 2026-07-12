"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProposalStore } from "@/store/useProposalStore";
import { useAuthStore } from "@/store/useAuthStore";
import { EngagementType, Proposal, ProposalStatus } from "@/types/Proposal";
import ProposalCard from "@/components/proposals/ProposalCard";
import { ProposalCardSkeleton } from "@/components/proposals/ProposalFeedSkeleton";
import Sidebar from "@/components/proposals/Sidebar";
import { Info } from "lucide-react";
import Psychology from "@material-symbols/svg-400/outlined/psychology.svg";
import School from "@material-symbols/svg-400/outlined/school.svg";
import { IconType } from "@/utils/SvgType";

type ProposalTab = "received" | "sent";

export type ProposalView = {
  id: string;
  partnerName: string;
  partnerImage: string;
  iTeach: string;
  iLearn: string;
  isSender: boolean;
  format: string;
  type: EngagementType;
  goal: string;
  expectedSessions: number;
  sessionDuration: number;
  skillToTeachIcon: IconType;
  skillToLearnIcon: IconType;
  senderID: string;
  receiverID: string;
  message: string;
  workspaceId?: string | null;
  status: ProposalStatus;
  dateCreated: number;
};

const statusStyles: Record<ProposalStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
  declined: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  withdrawn: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  expired: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  negotiating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20"
};

const ProposalsPage = () => {
  const [activeTab, setActiveTab] = useState<ProposalTab>("received");
  const { user } = useAuthStore();
  const { proposals, fetchProposals, loading, listenForProposalUpdates } = useProposalStore();

  const userId = user?.id || "";

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

 useEffect(() => {
  if (!userId) return;
  fetchProposals(userId);

  let cleanup: (() => void) | undefined;
  let cancelled = false;

  listenForProposalUpdates().then((fn) => {
    if (!cancelled) cleanup = fn;
    else fn(); 
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}, [userId]);

  const tabs: { id: ProposalTab; label: string }[] = [
    { id: "received", label: "Received" },
    { id: "sent", label: "Sent" },
  ];

  const getProposalCounts = (proposals: Proposal[]) => {
    return proposals.reduce(
      (acc, p) => {
        acc[p.status] += 1;
        return acc;
      },
      {
        pending: 0,
        accepted: 0,
        declined: 0,
        withdrawn: 0,
        expired: 0,
        negotiating: 0,
        completed: 0
      } as Record<ProposalStatus, number>,
    );
  };

  const counts = getProposalCounts(proposals);

  const mapProposal = (p: any): ProposalView => {
    const isSender = p.sender.id === userId;
    const status = p.status as ProposalStatus;
    const them = isSender ? p.receiver : p.sender;

    return {
      id: p.id,
      partnerName: them?.name || "Unknown",
      partnerImage: them?.avatar_url || "",
      format: p.session_format,
      type: p.engagement_type,
      isSender,
      senderID: p.sender.id,
      receiverID: p.receiver.id,
      message: p.message,
      goal: p.goal,
      expectedSessions: p.expected_number_of_sessions,
      sessionDuration: p.session_duration_minutes,
      dateCreated: new Date(p.created_at).getTime(),
      status,
      workspaceId: p.workspace?.id ?? null,
      iLearn: isSender ? p.learn_skill?.title : p.teach_skill?.title,
      iTeach: isSender ? p.teach_skill?.title : p.learn_skill?.title,
      skillToTeachIcon: School,
      skillToLearnIcon: Psychology,
    };
  };

  const mapped: ProposalView[] = proposals.map((p) => mapProposal(p));

  const filtered = mapped.filter((p) =>
    activeTab === "sent" ? p.isSender : !p.isSender,
  );

  return (
    <div className="w-full h-full flex flex-col px-4 py-6 md:px-8 md:py-10 max-w-8xl">
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Skill Proposals
          </h1>
          <p className="text-text-secondary mt-2 text-sm sm:text-base">
            Review, manage and finalize your skill exchange agreements.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="flex p-1 bg-surface/50 backdrop-blur-md rounded-xl border border-border w-full sm:w-auto overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 sm:flex-none px-4 sm:px-8 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeProposalTab"
                      className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8 mb-10">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1 mb-10">
          <AnimatePresence mode="wait">
            {loading ? (
              <ProposalCardSkeleton />
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-3xl"
              >
                <Info className="text-text-secondary mb-4" size={32} />
                <p className="text-text-secondary font-medium">
                  No {activeTab} proposals found.
                </p>
              </motion.div>
            ) : (
              filtered.map((p) => (
                <ProposalCard
                  key={p.id}
                  p={p}
                  now={now}
                  statusStyles={statusStyles}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        <Sidebar counts={counts} />
      </div>
    </div>
  );
};

export default ProposalsPage;

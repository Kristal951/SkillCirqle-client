"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Check, X, Info } from "lucide-react";
import { useProposalStore } from "@/store/useProposalStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  EngagementType,
  Proposal,
  ProposalStatus,
  SessionFormat,
} from "@/types/Proposal";
import Spinner from "@/components/ui/Spinner";
import ProposalCard from "@/components/proposals/ProposalCard";

type ProposalTab = "received" | "sent";

export type ProposalView = {
  id: string;

  partnerName: string;
  partnerImage: string;

  iTeach: string;
  iLearn: string;
  isSender: boolean;
  format: SessionFormat;
  type: EngagementType;

  theyTeach: string;
  theyLearn: string;
  skillToTeachIcon: string;
  skillToLearnIcon: string;
  senderID: string;
  receiverID: string;
  message: string;

  status: ProposalStatus;
  dateCreated: number;
};

const statusStyles: Record<ProposalStatus, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const ProposalsPage = () => {
  const [activeTab, setActiveTab] = useState<ProposalTab>("received");
  const { user } = useAuthStore();
  const { proposals, fetchProposals, loading } = useProposalStore();

  const userId = user?.id || "";

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProposals(userId);
  }, []);

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
        active: 0,
        pending: 0,
        completed: 0,
        rejected: 0,
      } as Record<ProposalStatus, number>,
    );
  };

  const counts = getProposalCounts(proposals);

  const mapProposal = (p: any): ProposalView => {
    const isSender = p.sender.id === userId;
    const status = p.status as ProposalStatus;

    const me = isSender ? p.sender : p.receiver;
    const them = isSender ? p.receiver : p.sender;

    return {
      id: p.id,

      partnerName: them?.name || "Unknown",
      partnerImage: them?.avatar_url || "",
      format: p.session_format,
      type: p.engagement_type,

      iTeach: p.teach_skill,
      iLearn: p.learn_skill,
      isSender,
      senderID: p.sender.id,
      receiverID: p.receiver.id,

      theyTeach: isSender ? p.learn_skill : p.teach_skill,
      theyLearn: isSender ? p.teach_skill : p.learn_skill,
      skillToTeachIcon: "school",
      skillToLearnIcon: "psychology",
      message: p.message,

      dateCreated: new Date(p.created_at).getTime(),

      status,
    };
  };

  const mapped: ProposalView[] = proposals.map((p) => mapProposal(p));

  const filtered = mapped.filter((p) =>
    activeTab === "sent" ? p.isSender : !p.isSender,
  );

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-8 py-6 sm:py-10 max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 sm:mt-12">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20 text-text-secondary"
              >
                <Spinner size={30} />
              </motion.div>
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

        <aside className="lg:col-span-1 space-y-6 order-1 lg:order-2">
          <div className="bg-surface rounded-3xl p-6 border border-border">
            <h3 className="font-bold mb-4 text-lg">Activity Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                {
                  label: "Active",
                  value: counts.active,
                  color: "text-blue-500",
                },
                {
                  label: "Pending",
                  value: counts.pending,
                  color: "text-amber-500",
                },
                {
                  label: "Completed",
                  value: counts.completed,
                  color: "text-emerald-500",
                },
                {
                  label: "Rejected",
                  value: counts.rejected,
                  color: "text-red-500",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-background rounded-xl border border-border"
                >
                  <span className="text-xs text-text-secondary font-medium">
                    {stat.label}
                  </span>
                  <span className={`font-bold text-sm ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden sm:block bg-primary/5 rounded-3xl p-6 border border-primary/10">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Info size={16} /> Pro-Tip
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Proposals expire after 48 hours. Quick responses increase your
              matching score!
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProposalsPage;

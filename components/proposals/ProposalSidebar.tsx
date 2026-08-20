"use client";

import Spinner from "@/components/ui/Spinner";
import SummaryItem from "./SummaryItem";
import React from "react";

type Profile = { name: string; avatar_url: string };

type Props = {
  profile: Profile;
  activeTab: "learn" | "swap";
  isSwap: boolean;
  learnSkillName: string;
  teachSkillName: string;
  goal: string;
  sessionDurationType: "quick" | "standard";
  message: string;
  canSend: boolean;
  sending: boolean;
  onSend: () => void;
};

const ProposalSidebar = ({
  profile,
  activeTab,
  isSwap,
  learnSkillName,
  teachSkillName,
  goal,
  sessionDurationType,
  message,
  canSend,
  sending,
  onSend,
}: Props) => {
  return (
    <aside className="lg:block hidden w-full md:block py-10">
      <div className="sticky top-6 rounded-3xl border border-border bg-surface/50 p-6">
        <h3 className="font-bold text-xl">Proposal Summary</h3>
        <div className="space-y-5 mt-6">
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs uppercase text-text-secondary">
                Sending to
              </p>
              <p className="font-semibold">{profile.name}</p>
            </div>
          </div>

          <div className="border-t border-border/50" />

          <SummaryItem
            label="Type"
            value={activeTab === "learn" ? "Learning Request" : "Skill Swap"}
          />
          <SummaryItem
            label="Skill to Learn"
            value={learnSkillName || "Not selected"}
          />
          {isSwap && (
            <SummaryItem
              label="Skill to Teach"
              value={teachSkillName || "Not selected"}
            />
          )}
          <SummaryItem label="Goal" value={goal || "Not provided"} />
          <SummaryItem
            label="Session Duration"
            value={
              sessionDurationType === "quick"
                ? "Quick (20 min)"
                : "Standard (30–60 min)"
            }
          />
          {/* <SummaryItem
            label="Expected Sessions"
            value={`${expectedSessions} ${expectedSessions === 1 ? "session" : "sessions"}`}
          /> */}
          {message && (
            <div>
              <p className="text-xs uppercase text-text-secondary">Message</p>
              <p className="font-medium mt-1 text-sm text-text-secondary line-clamp-3">
                {message}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onSend}
          disabled={!canSend || sending}
          className="w-full mt-8 py-4 rounded-2xl bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold"
        >
          {sending ? <Spinner /> : "Send Proposal"}
        </button>
      </div>
    </aside>
  );
};

export default React.memo(ProposalSidebar);

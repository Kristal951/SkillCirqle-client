"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUserProfile } from "@/hooks/UserProfileContext";
import { useAuthStore } from "@/store/useAuthStore";
import { createProposal } from "@/utils/createProposal";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/lib/toast";

type EngagementType = "learn" | "swap";
type SessionFormat = "one-on-one" | "group";

export default function NewProposal() {
  const [activeTab, setActiveTab] = useState<EngagementType>("learn");
  const [activeFormatTab, setActiveFormatTab] =
    useState<SessionFormat>("one-on-one");
  const [teachSkill, setTeachSkill] = useState("");
  const [learnSkill, setLearnSkill] = useState("");
  const [message, setMessage] = useState("");
  const [sendingProposal, setSendingProposal] = useState<boolean>(false);
  const [userEditedMessage, setUserEditedMessage] = useState(false);

  const { user: profile } = useUserProfile();
  const { user } = useAuthStore();

  const profileSkills = profile?.skills_to_teach || [];
  const userSkills = user?.skills_to_teach || [];

  const cleanUp = () => {
    setActiveTab("learn");
    setActiveFormatTab("one-on-one");
    setTeachSkill("");
    setLearnSkill("");
    setMessage("");
    setUserEditedMessage(false);
  };

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="bg-surface/50 p-4 rounded-xl">
            <span
              className="material-symbols-outlined "
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 200",
                fontSize: "120px",
              }}
            >
              person_off
            </span>
          </div>

          <h2 className="text-4xl font-semibold">Profile not found</h2>

          <p className="text-sm text-text-secondary max-w-xs">
            This user profile could not be loaded. It may have been removed or
            is temporarily unavailable.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (userEditedMessage) return;

    if (activeTab === "swap") {
      if (teachSkill && learnSkill) {
        setMessage(
          `Hey, I can teach you ${teachSkill} and you can teach me ${learnSkill} in return.`,
        );
      }
    } else {
      if (learnSkill) {
        setMessage(
          `Hey, I’d like to learn ${learnSkill} from you. Let me know if you're available.`,
        );
      }
    }
  }, [teachSkill, learnSkill, activeTab, userEditedMessage]);

  const engagementTabs = [
    { id: "learn", label: "Direct Learn", icon: "book_5" },
    { id: "swap", label: "Skill Swap", icon: "swap_horiz" },
  ];

  const formatTabs = [
    { id: "one-on-one", label: "One-on-One", icon: "person" },
    { id: "group", label: "Group Session", icon: "groups" },
  ];

  const handleSendProposal = async () => {
    if (!user?.id || !profile?.id) {
      toast.error("Error", "User information is missing.");
      return;
    }

    if (activeTab === "swap" && !teachSkill) {
      toast.error("Missing skill", "Please select a skill to teach.");
      return;
    }

    if (activeTab === "swap" && !learnSkill) {
      toast.error("Missing skill", "Please select a skill to learn.");
      return;
    }

    if (!message.trim()) {
      toast.error("Empty message", "Please add a message.");
      return;
    }

    if (message.length > 100) {
      toast.error("Too long", "Message must not exceed 100 characters.");
      return;
    }

    setSendingProposal(true);

    try {
      await createProposal({
        senderId: user.id,
        senderName: user?.name || '',
        receiverId: profile.id,
        teachSkill,
        learnSkill,
        message,
        engagementType: activeTab,
        sessionFormat: activeFormatTab,
      });

      toast.success(
        "Proposal Sent",
        `Your proposal has been sent to ${profile.name}.`,
      );

      cleanUp();
    } catch (error: any) {
      console.error(error);

      toast.error(
        "Proposal Failed",
        error?.message || "Something went wrong while sending proposal.",
      );
    } finally {
      setSendingProposal(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-8 px-4 sm:px-8 py-6 max-w-3xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Propose an Exchange
        </h1>
        <p className="text-sm text-text-secondary">
          {" "}
          Collaborative knowledge exchange with {profile?.name || "this mentor"}
          .
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-surface/40 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl space-y-10">
        <section className="space-y-4">
          <header className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-[10px] font-black border border-border shadow-inner">
              1
            </span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
              Engagement Type
            </h2>
          </header>

          <div className="grid grid-cols-2 p-1.5 bg-background rounded-2xl border border-border">
            {engagementTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as EngagementType)}
                  className={`relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="engagementTab"
                      className="absolute inset-0 bg-surface shadow-sm rounded-lg border border-border/40"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <span className="material-symbols-outlined relative z-10 text-xl">
                    {tab.icon}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-[10px] font-black border border-border">
              2
            </span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
              Session Format
            </h2>
          </header>

          <div className="grid grid-cols-2 gap-3">
            {formatTabs.map((tab) => {
              const isActive = activeFormatTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormatTab(tab.id as SessionFormat)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? "bg-primary/5 border-primary text-text-primary shadow-lg shadow-primary/5"
                      : "bg-background border-border text-text-secondary hover:border-text-secondary/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-surface"}`}
                  >
                    <span className="material-symbols-outlined">
                      {tab.icon}
                    </span>
                  </div>
                  <span className="font-bold text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-[10px] font-black border border-border">
              3
            </span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
              Skill Details
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "swap" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-text-secondary ml-1">
                  I will teach you
                </label>

                <select
                  className="w-full p-4 bg-background border border-border rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  value={teachSkill}
                  onChange={(e) => setTeachSkill(e.target.value)}
                >
                  <option value="">Select a skill...</option>
                  {userSkills.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-text-secondary ml-1">
                I want to learn
              </label>
              <select
                className="w-full p-4 bg-background border border-border rounded-2xl text-sm font-medium focus:ring-2 focus:ring-accent/20 outline-none"
                value={learnSkill}
                onChange={(e) => setLearnSkill(e.target.value)}
              >
                <option value="">Select a skill...</option>
                {profileSkills.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-[10px] font-black border border-border">
                4
              </span>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                Add message
              </h2>
            </div>
            <span
              className={`text-[10px] font-bold ${message.length >= 100 ? "text-rose-500" : "text-text-secondary"}`}
            >
              {message.length}/100
            </span>
          </header>

          <textarea
            value={message}
            autoFocus
            onChange={(e) => {
              setMessage(e.target.value);
              setUserEditedMessage(true);
            }}
            className="w-full min-h-30 rounded-2xl bg-background border border-border p-5 text-sm resize-none focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            placeholder="Type your message..."
          />
        </section>

        <div className="flex items-center justify-end pt-4">
          <button
            onClick={handleSendProposal}
            disabled={
              message.length > 100 ||
              !learnSkill ||
              (activeTab === "swap" && !teachSkill) ||
              sendingProposal
            }
            className="group px-10 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.95] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center"
          >
            {sendingProposal ? (
              <div className="flex gap-3">
                <p className="">Sending</p>
                <Spinner />
              </div>
            ) : (
              <div className="flex gap-3">
                <p> Send Proposal</p>
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  send
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

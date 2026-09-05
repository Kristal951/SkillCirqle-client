"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUserProfile } from "@/hooks/UserProfileContext";
import { useAuthStore } from "@/store/useAuthStore";
import { createProposal } from "@/utils/createProposal";
import Spinner from "@/components/ui/Spinner";
import { toast } from "@/lib/toast";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import ProposalTypeSelector from "@/components/proposals/ProposalTypeSelector";
import SessionDurationSelector from "@/components/proposals/SessionDurationSelector";
// import ExpectedSessionsCounter from "@/components/proposals/ExpectedSessionsCounter";
import SkillDetailsSelector from "@/components/proposals/SkillDetailsSelector";
import GoalSection from "@/components/proposals/GoalSection";
import MessageSection from "@/components/proposals/MessageSection";
import ProposalSidebar from "@/components/proposals/ProposalSidebar";
import { useQuery } from "@tanstack/react-query";

import PersonOff from "@material-symbols/svg-400/outlined/person_off.svg"
import Swap_Horiz from "@material-symbols/svg-400/outlined/swap_horiz.svg"
import School from "@material-symbols/svg-400/outlined/school.svg"
import Bolt from "@material-symbols/svg-400/outlined/bolt.svg"
import { Info } from "lucide-react";

type EngagementType = "learn" | "swap";
type SessionType = "quick" | "standard";

const sessionTypeTabs = [
  {
    id: "quick",
    label: "Quick Session",
    info: "Up to 20 minutes. Perfect for quick questions, reviews, and focused guidance.",
    icon: Bolt,
  },
  {
    id: "standard",
    label: "Standard Session",
    info: "30–60 minute sessions designed for structured teaching and long-term skill growth.",
    icon: School,
  },
];

const fetchUserTeachSkills = async (userId: string) => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_skills")
    .select("skill_id, skills(id, title)")
    .eq("user_id", userId)
    .eq("type", "teach")
    .eq('verified', true)

  if (error) throw new Error(error.message);

  return data.map((us: any) => ({
    id: us.skills.id,
    title: us.skills.title,
  }));
};

export default function NewProposal() {
  const [activeTab, setActiveTab] = useState<EngagementType>("swap");
  const [sessionDurationType, setSessionDurationType] =
    useState<SessionType>("quick");
  const [teachSkillId, setTeachSkillId] = useState("");
  const [teachSkillName, setTeachSkillName] = useState("");
  const [learnSkillId, setLearnSkillId] = useState("");
  const [learnSkillName, setLearnSkillName] = useState("");
  const [message, setMessage] = useState("");
  const [goal, setGoal] = useState("");
  const [sendingProposal, setSendingProposal] = useState(false);
  const [userEditedMessage, setUserEditedMessage] = useState(false);
  // const [expectedSessions, setExpectedSessions] = useState(5);

  const { user: profile } = useUserProfile();
  const { user } = useAuthStore();

  const isSwap = activeTab === "swap";

  const profileSkills = useMemo(
    () =>
      profile?.user_skills?.map(
        (us: { skill_id: string; skills: { id: string; title: string } }) => ({
          id: us.skills.id,
          title: us.skills.title,
        }),
      ) || [],
    [profile?.user_skills],
  );

  const canSendProposal = useMemo(
    () =>
      !!learnSkillId &&
      !!message.trim() &&
      message.length <= 500 &&
      (!isSwap || !!teachSkillId),
    [learnSkillId, message, isSwap, teachSkillId],
  );

  const engagementOptions = useMemo(
    () => [
      {
        id: "swap",
        title: "Skill Swap",
        icon: Swap_Horiz,
        desc: `Exchange skills with ${profile?.name} in a balanced partnership`,
      },
      {
        id: "learn",
        title: "Learn Skill",
        icon: School,
        desc: `Focus on skill acquisition directly from ${profile?.name}`,
      },
    ],
    [profile?.name],
  );

  const cleanUp = useCallback(() => {
    setActiveTab("learn");
    setSessionDurationType("quick");
    setTeachSkillId("");
    setTeachSkillName("");
    setLearnSkillId("");
    setLearnSkillName("");
    setMessage("");
    setUserEditedMessage(false);
    setGoal("");
    // setExpectedSessions(5);
  }, []);

  const handleTeachChange = useCallback((id: string, name: string) => {
    setTeachSkillId(id);
    setTeachSkillName(name);
  }, []);

  const handleLearnChange = useCallback((id: string, name: string) => {
    setLearnSkillId(id);
    setLearnSkillName(name);
  }, []);

  const handleTabChange = useCallback((tab: EngagementType) => {
    setActiveTab(tab);
    setTeachSkillId("");
    setTeachSkillName("");
    setLearnSkillId("");
    setLearnSkillName("");
    setUserEditedMessage(false);
  }, []);

  const handleSendProposal = useCallback(async () => {
    if (!user?.id || !profile?.id) {
      toast.error("Error", "User information is missing.");
      return;
    }
    if (isSwap && !teachSkillId) {
      toast.error("Missing skill", "Please select a skill to teach.");
      return;
    }
    if (!learnSkillId) {
      toast.error("Missing skill", "Please select a skill to learn.");
      return;
    }
    if (!message.trim()) {
      toast.error("Empty message", "Please add a message.");
      return;
    }
    if (message.length > 500) {
      toast.error("Too long", "Message must not exceed 500 characters.");
      return;
    }

    setSendingProposal(true);

    try {
      await createProposal({
        senderId: user.id,
        senderName: user?.name || "",
        senderImage: user?.avatar_url || "",
        receiverId: profile.id,
        teachSkillId,
        teachSkillName,
        learnSkillId,
        learnSkillName,
        message,
        goal,
        // expectedSessions,
        session_format: 'one-one-one',
        engagementType: activeTab,
        sessionDurationType,
        link: "/proposals",
      });

      toast.success(
        "Proposal Sent",
        `Your proposal has been sent to ${profile.name}.`,
      );
      cleanUp();
    } catch (error: any) {
      console.error(error);

      const message = error?.message || "Something went wrong. Please try again.";

      const isVerificationError = message.toLowerCase().includes("verified skill");

      toast.error(
        isVerificationError ? "Verification Required" : "Proposal Failed",
        message,
      );
    } finally {
      setSendingProposal(false);
    }
  }, [
    user,
    profile,
    isSwap,
    teachSkillId,
    teachSkillName,
    learnSkillId,
    learnSkillName,
    message,
    goal,
    // expectedSessions,
    activeTab,
    sessionDurationType,
    cleanUp,
  ]);

  useEffect(() => {
    if (message && userEditedMessage) return;

    const timer = setTimeout(() => {
      if (isSwap && teachSkillName && learnSkillName) {
        setMessage(
          `Hey, I can teach you ${teachSkillName} and you can teach me ${learnSkillName} in return.`,
        );
      } else if (!isSwap && learnSkillName) {
        setMessage(
          `Hey, I'd like to learn ${learnSkillName} from you. Let me know if you're available.`,
        );
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [teachSkillName, learnSkillName, activeTab, userEditedMessage, message]);

  const { data: userSkills = [], error } = useQuery({
    queryKey: ["user-teach-skills", user?.id],
    queryFn: () => fetchUserTeachSkills(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: 1000,
  });

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="bg-surface/50 p-4 rounded-xl">
            <PersonOff className="text-text-secondary text-[120px]" />
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

  return (
    <div className="w-full h-full px-4 md:px-10 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Send a Proposal
        </h1>
        <p className="text-sm text-text-secondary">
          {" "}
          Start a structured learning journey with{" "}
          <span className="text-text-primary font-semibold">
            {profile?.name || "this user"}.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-10 w-full">
        <div className=" pt-10 space-y-10">
          <ProposalTypeSelector
            activeTab={activeTab}
            options={engagementOptions}
            disabled={sendingProposal}
            onChange={handleTabChange}
          />
          <SessionDurationSelector
            value={sessionDurationType}
            tabs={sessionTypeTabs}
            disabled={sendingProposal}
            onChange={setSessionDurationType}
          />
          {/* <ExpectedSessionsCounter
            value={expectedSessions}
            disabled={sendingProposal}
            onChange={setExpectedSessions}
          /> */}
          <SkillDetailsSelector
            isSwap={isSwap}
            disabled={sendingProposal}
            teachSkillId={teachSkillId}
            learnSkillId={learnSkillId}
            userSkills={userSkills}
            profileSkills={profileSkills}
            onTeachChange={handleTeachChange}
            onLearnChange={handleLearnChange}
          />

          <GoalSection
            goal={goal}
            sendingProposal={sendingProposal}
            setGoal={setGoal}
          />

          <MessageSection
            message={message}
            sendingProposal={sendingProposal}
            setMessage={setMessage}
            setUserEditedMessage={setUserEditedMessage}
          />

          {
            activeTab === "learn" && (
              <div className="md:hidden bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <Info size={16} /> Pro-Tip
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Please note that <span className="text-accent font-semibold">5 SkillCredits</span> will be deducted when you send a learn proposal.
                </p>
              </div>
            )
          }

          <div className="w-full pb-4">
            <button
              onClick={handleSendProposal}
              disabled={!canSendProposal || sendingProposal}
              className="bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold w-full md:hidden flex items-center justify-center gap-3 py-3 rounded-lg transition-opacity"
            >
              {sendingProposal ? (
                <>
                  <span>Sending</span>
                  <Spinner />
                </>
              ) : (
                "Send Proposal"
              )}
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col">
          <ProposalSidebar
            profile={profile}
            activeTab={activeTab}
            isSwap={isSwap}
            learnSkillName={learnSkillName}
            teachSkillName={teachSkillName}
            goal={goal}
            sessionDurationType={sessionDurationType}
            // expectedSessions={expectedSessions}
            message={message}
            canSend={canSendProposal}
            sending={sendingProposal}
            onSend={handleSendProposal}
          />

          {
            activeTab === "learn" && (
              <div className="hidden md:block bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <Info size={16} /> Pro-Tip
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Please note that <span className="text-accent font-semibold">5 SkillCredits</span> will be deducted when you send a learn proposal.
                </p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

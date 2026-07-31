"use client";
import SkillsCard from "@/components/profile/SkillsCard";
import Spinner from "@/components/ui/Spinner";
import { useUserProfile } from "@/hooks/UserProfileContext";
import { useAuthStore } from "@/store/useAuthStore";
import { getOrCreateConversation } from "@/utils/getOrCreateConversation";
import {
  BookOpen,
  ChevronRight,
  Coins,
  GraduationCap,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Psychology from "@material-symbols/svg-400/outlined/psychology.svg";
import School from "@material-symbols/svg-400/outlined/school.svg";
import SwapHoriz from "@material-symbols/svg-400/outlined/swap_horiz.svg";
import Star from "@material-symbols/svg-400/outlined/star.svg";
import Mail from "@material-symbols/svg-400/outlined/mail.svg";
import Reviews from "@material-symbols/svg-400/outlined/reviews.svg";
import { useCanMessage } from "@/hooks/useCanMessage";
import { GitCompare, X } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { getConversationById } from "@/utils/getConversationDetails";

interface UserSkillRow {
  skill_id: string;
  name: string;
  type: "teach" | "learn";
  verified: boolean;
}

export default function UserProfilePage() {
  const { user: profile } = useUserProfile();
  const { user } = useAuthStore();
  const { setActiveChat } = useChatStore();
  const [creatingConv, setCreatingConv] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [userSkills, setUserSkills] = useState<UserSkillRow[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const router = useRouter();

  const { theme } = useTheme();
  const { canMessage, checking } = useCanMessage(user?.id, profile?.id);

  const isLoggedInUser = user?.id === profile?.id;
  const userId = user?.id || "";

  const handleStartProposal = () => {
    router.push(`/proposals/new/${profile?.id}`);
  };
  const profileFirstName = profile?.name?.split(" ")[0] || "them";

  const statCardData = [
    {
      title: "Exchanges",
      icon: SwapHoriz,
      value: profile?.exchanges,
    },
    {
      title: "Rating",
      icon: Star,
      value: profile?.rating,
    },
  ];

  const handleConversation = async () => {
    setCreatingConv(true);
    const userA = user?.id || "";
    const userB = profile?.id || "";
    try {
      const convID = await getOrCreateConversation(userA, userB);
      const chatData = await getConversationById(convID, userId);
      router.push("/chat");
      setActiveChat(chatData);
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingConv(false);
    }
  };

  if (isLoggedInUser) {
    return router.push("/profile");
  }

  useEffect(() => {
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const res = await fetch(`/api/user/skills/skill-with-id?userId=${profile?.id}`);
        const data = await res.json();

        if (res.ok) {
          setUserSkills(data.skills || []);
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const teachSkills = userSkills.filter((s) => s.type === "teach");
  const learnSkills = userSkills.filter((s) => s.type === "learn");

  return (
    <section className="relative mb-12 w-full md:px-4  h-full flex flex-col py-6">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
        <div className="w-full flex flex-col">
          <div className="lg:flex flex flex-col lg:flex-row h-max md:items-end md:justify-between">
            <div className="flex flex-col lg:flex-row lg:flex items-center w-full justify-center md:justify-start gap-5">
              <div className="w-35 h-35 group rounded-full border-primary border-2 bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-semibold">
                {profile?.avatar_url ? (
                  <img
                    src={profile?.avatar_url}
                    alt="Profile Image"
                    className="w-full group-hover:scale-110 transition-all h-full object-cover"
                  />
                ) : (
                  <div>
                    {profile?.avatar_url ||
                      profile?.name?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                )}
              </div>
              <div className="h-full flex flex-col items-center md:items-center lg:items-start md:w-max justify-between gap-2">
                <h2
                  className={`text-4xl font-bold  lg:text-left  ${theme === "light" ? "text-primary" : "text-white"}`}
                >
                  {profile?.name}
                </h2>
                <p className="max-w-lg text-lg text-center md:text-center lg:text-left leading-relaxed text-text-secondary line-clamp-3">
                  {profile?.bio || "No Bio yet."}
                </p>
              </div>
            </div>

            <div className="flex gap-8 w-full pt-10 justify-center lg:justify-end">
              <button
                onClick={handleStartProposal}
                className="px-4 flex items-center justify-center gap-2 py-3 bg-primary text-text-primary rounded-md border-border border font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Send Proposal
                <ChevronRight size={20} />
              </button>

              {canMessage ? (
                <button
                  disabled={creatingConv}
                  onClick={handleConversation}
                  className="px-4 py-3 rounded-md border gap-2 border-border flex items-center justify-center text-text-primary font-bold hover:bg-primary/10 transition-colors"
                >
                  {creatingConv ? (
                    <Spinner size={20} />
                  ) : (
                    <div className="w-full flex items-center gap-2">
                      <Mail />
                      <p>Message</p>
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowCompare(true)}
                  className="px-4 py-3 rounded-md border gap-2 border-border flex items-center justify-center text-text-primary font-bold hover:bg-primary/10 transition-colors"
                >
                  <GitCompare size={20} />
                  <p>Compare Skills</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-full grid-cols-3 md:grid py-10 gap-8">
        {statCardData.map((info, i) => {
          const Icon = info.icon;
          return (
            <div
              key={i}
              className="col-span-1 p-6 rounded-md flex items-center gap-6 hover:bg-surface transition-colors bg-surface/50"
            >
              <div className="bg-background w-12 h-12 flex items-center justify-center rounded-xl">
                <Icon className="text-2xl" />
              </div>
              <div>
                <h2
                  className={`text-3xl font-bold ${theme === "light" ? "" : "text-text-primary"}`}
                >
                  {info.title === "Rating"
                    ? (info?.value ?? 0).toFixed(2)
                    : (info.value ?? 0)}
                </h2>
                <h3 className="text-sm uppercase tracking-wider font-semibold">
                  {info.title}
                </h3>
              </div>
            </div>
          );
        })}
        <div className="col-span-1 p-6 rounded-md flex items-center gap-6 hover:bg-surface transition-colors bg-surface/50">
          <div className="bg-background w-12 h-12 flex items-center justify-center rounded-xl">
            <Coins />
          </div>
          <div>
            <h2
              className={`text-3xl font-bold ${theme === "light" ? "" : "text-text-primary"}`}
            >
              {profile?.skill_tokens || 0}
            </h2>
            <h3 className="text-sm uppercase tracking-wider font-semibold">
              Credits
            </h3>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:hidden">
        <div className=" p-4 grid grid-cols-3 rounded-md bg-surface mt-6 mb-6 place-content-center">
          {statCardData.map((info, i) => (
            <div className="colo-span-1 border-r border-border" key={i}>
              <div className="flex w-full flex-col items-center justify-center">
                <h2 className="text-[10px] uppercase tracking-wider font-semibold">
                  {info.title}
                </h2>
                <p className="text-xl font-bold">
                  {" "}
                  {info.title === "Rating"
                    ? (info?.value ?? 0).toFixed(2)
                    : (info.value ?? 0)}
                </p>
              </div>
            </div>
          ))}
          <div className="col-span-1">
            <div className="w-full flex items-center flex-col justify-center">
              <h3 className="text-[10px] uppercase tracking-wider font-semibold">
                Tokens
              </h3>
              <p className="text-xl font-bold"> {profile?.skill_tokens || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className=" w-full grid lg:grid-cols-3 gap-8">
        <div className="col-span-2 grid gap-8">
          <SkillsCard
            title="Skills i can teach"
            skills={teachSkills.map((s) => ({
              name: s.name,
              verified: s.verified,
            }))}
            icon={Psychology}
            color="primary"
            loading={loadingSkills}
          />
          <SkillsCard
            title="Skills i want to learn"
            skills={learnSkills.map((s) => s.name)}
            icon={School}
            color="accent"
            loading={loadingSkills}
          />
        </div>

        <div className="col-span-1 bg-surface/50 hover:bg-surface p-4 h-90 rounded-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center bg-background rounded-xl justify-center border border-border shadow-inner">
              <Reviews className="text-text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Reviews</h1>
          </div>

          {(profile?.rating || 0) > 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold">
                {profile?.rating.toFixed(1)}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Your Reviews</p>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col gap-2 items-center justify-center">
              <h1
                className={`text-2xl font-bold ${theme === "light" ? "" : "text-text-primary"}`}
              >
                No Reviews Yet.
              </h1>
              <h3 className="text-sm text-text-secondary">
                Cirqlise more to gain reviews.
              </h3>
            </div>
          )}
        </div>
      </div>

      {showCompare && (
        <div
          onClick={() => setShowCompare(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">
                  Skill Match
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Explore how you and{" "}
                  <span className="text-text-primary">{profileFirstName}</span>{" "}
                  align.
                </p>
              </div>

              <button
                onClick={() => setShowCompare(false)}
                className="p-2 rounded-xl hover:bg-background/50 transition-colors text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {[
                {
                  title: `${profileFirstName} can teach you`,
                  icon: <BookOpen size={18} />,
                  skills: (profile?.skills_to_teach || []).filter((s: any) =>
                    (user?.skills_to_learn || []).includes(s),
                  ),
                  style: "bg-primary/5 border-primary/10 text-primary",
                },
                {
                  title: `You can teach ${profileFirstName}`,
                  icon: <GraduationCap size={18} />,
                  skills: (user?.skills_to_teach || []).filter((s) =>
                    (profile?.skills_to_learn || []).includes(s),
                  ),
                  style: "bg-accent/5 border-accent/10 text-accent",
                },
                {
                  title: `You and ${profileFirstName} both know:`,
                  icon: <Users size={18} />,
                  skills: (user?.skills_to_teach || []).filter((s) =>
                    (profile?.skills_to_teach || []).includes(s),
                  ),
                  style: "bg-background border-border text-secondary",
                },
              ].map((section, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-3 text-secondary font-bold text-xs uppercase tracking-wider">
                    {section.icon}
                    {section.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.skills.length > 0 ? (
                      section.skills.map((skill: any) => (
                        <span
                          key={skill}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${section.style}`}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-secondary italic">
                        No matching skills found.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-background/50 border-t border-border/50 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowCompare(false);
                  handleStartProposal();
                }}
                className="w-full py-3.5 flex items-center justify-center gap-2 bg-primary text-text-primary rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                <Send size={18} />
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

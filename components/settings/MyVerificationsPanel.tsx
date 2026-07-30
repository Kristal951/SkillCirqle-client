"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/lib/toast";
import {
  BadgeCheck,
  Clock,
  X,
  Link2,
  FileText,
  ExternalLink,
  Trash2,
  RotateCcw,
  Sparkles,
  Inbox,
} from "lucide-react";
import {
  VerifySkillModal,
  VerifiableSkill,
} from "@/components/VerifySkillModal";

interface MyVerification {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  proof_type: "link" | "file";
  proof_url: string;
  note: string | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  skill_id: string;
  skill_name: string;
}

interface TeachSkill {
  skill_id: string;
  name: string;
  verified: boolean;
}

const STATUS_MAP: Record<
  MyVerification["status"],
  { container: string; badge: string; icon: React.ReactNode; label: string }
> = {
  PENDING: {
    container: "border-border bg-background",
    badge:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <Clock size={12} className="stroke-[2.5]" />,
    label: "Pending Review",
  },
  APPROVED: {
    container: "border-emerald-500/10 bg-emerald-500/[0.02]",
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <BadgeCheck size={12} className="stroke-[2.5]" />,
    label: "Verified",
  },
  REJECTED: {
    container: "border-border bg-background",
    badge: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: <X size={12} className="stroke-[2.5]" />,
    label: "Rejected",
  },
};

const RowSkeleton = () => (
  <div className="flex items-center justify-between gap-4 p-5 bg-muted/30 border border-border/60 rounded-xl animate-pulse">
    <div className="space-y-2.5 flex-1">
      <div className="h-4 bg-muted-foreground/15 rounded w-1/4" />
      <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
    </div>
    <div className="h-7 w-24 bg-muted-foreground/15 rounded-full" />
  </div>
);

export const MyVerificationsPanel = () => {
  const { user } = useAuthStore();
  const supabase = getSupabaseBrowserClient();

  const [verifications, setVerifications] = useState<MyVerification[]>([]);
  const [teachSkills, setTeachSkills] = useState<TeachSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<VerifiableSkill | null>(
    null,
  );

  const fetchAll = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const [verificationsRes, skillsRes] = await Promise.all([
        supabase
          .from("my_skill_verifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        fetch("/api/user/skills/skill-with-id?type=teach").then((r) =>
          r.json(),
        ),
      ]);

      console.log(skillsRes)

      if (verificationsRes.error) {
        console.error(
          "Verification loading error:",
          verificationsRes.error.message,
        );
        toast.error("Couldn't load your verifications.");
      } else {
        setVerifications(
          (verificationsRes.data || []).map((row: any) => ({
            id: row.id,
            status: row.status,
            proof_type: row.proof_type,
            proof_url: row.proof_url,
            note: row.note,
            rejection_reason: row.rejection_reason,
            created_at: row.created_at,
            reviewed_at: row.reviewed_at,
            skill_id: row.skill_id,
            skill_name: row.skill_name,
          })),
        );
      }
      setTeachSkills(skillsRes.skills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user?.id]);

  const handleWithdraw = async (id: string) => {
    setWithdrawingId(id);
    try {
      const { error } = await supabase.rpc("withdraw_skill_verification", {
        p_verification_id: id,
      });

      if (error) {
        toast.error(error.message || "Failed to withdraw.");
        return;
      }

      setVerifications((prev) => prev.filter((v) => v.id !== id));
      toast.info("Verification request withdrawn.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const submittedSkillIds = new Set(verifications.map((v) => v.skill_id));
  const unsubmittedSkills = teachSkills.filter(
    (s) => !s.verified && !submittedSkillIds.has(s.skill_id),
  );

  return (
    <div className="space-y-10 p-6 md:p-8 bg-surface/40 border border-border/10 rounded-3xl">
      <div className="space-y-1.5 border-b border-border/60 pb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Skill Verifications
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl">
          Earn credibility badges on your profile by providing proof of
          expertise.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <RowSkeleton />
            <RowSkeleton />
          </div>
        ) : verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-muted/5 text-center space-y-3">
            <div className="p-3 bg-muted rounded-full">
              <Inbox size={20} className="text-muted-foreground/70" />
            </div>
            <p className="text-sm text-muted-foreground">
              No active or historical verification applications found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {verifications.map((v) => {
              const style = STATUS_MAP[v.status];

              return (
                <div
                  key={v.id}
                  className={`flex flex-col gap-4 p-5 border rounded-xl shadow-sm transition-all duration-200 ${style.container}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="font-semibold text-foreground tracking-tight truncate">
                        {v.skill_name}
                      </h4>

                      <div className="flex w-full items-center h-max gap-4 justify-center">
                        {(v.status === "PENDING" ||
                          v.status === "REJECTED") && (
                          <div className="flex items-center gap-3 border-t border-border/40">
                            {v.status === "PENDING" && (
                              <button
                                onClick={() => handleWithdraw(v.id)}
                                disabled={withdrawingId === v.id}
                                className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-destructive transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                                {withdrawingId === v.id
                                  ? "Withdrawing Request..."
                                  : "Withdraw Submission"}
                              </button>
                            )}

                            {v.status === "REJECTED" && (
                              <button
                                onClick={() =>
                                  setSelectedSkill({
                                    id: v.skill_id,
                                    name: v.skill_name,
                                  })
                                }
                                className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-primary/80 transition-colors"
                              >
                                <RotateCcw size={13} />
                                Resubmit Application
                              </button>
                            )}
                          </div>
                        )}

                        <a
                          href={v.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors group w-max"
                        >
                          {v.proof_type === "link" ? (
                            <Link2 size={13} />
                          ) : (
                            <FileText size={13} />
                          )}
                          <span>View Attachment Proof</span>
                          <ExternalLink
                            size={11}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                        </a>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${style.badge}`}
                    >
                      {style.icon}
                      {style.label}
                    </span>
                  </div>

                  {/* {v.status === "REJECTED" && v.rejection_reason && (
                    <div className="text-xs bg-destructive/[0.03] border border-destructive/10 text-destructive/90 rounded-lg p-3 space-y-0.5">
                      <span className="font-bold">Rejection Feedback:</span>
                      <p className="text-muted-foreground">
                        {v.rejection_reason}
                      </p>
                    </div>
                  )} */}
                </div>
              );
            })}
            {unsubmittedSkills &&
              unsubmittedSkills.map((skill, i) => (
                <div
                  key={skill.skill_id}
                  className="flex items-center justify-between gap-4 p-5 bg-background border border-border rounded-xl shadow-sm transition-all duration-200"
                >
                  <h4 className="font-semibold text-foreground tracking-tight truncate">
                    {skill.name}
                  </h4>

                  <button onClick={() => setSelectedSkill({ id: skill.skill_id, name: skill.name })} className="flex items-center gap-3 bg-surface/50 px-4 py-1 rounded-md hover:bg-surface">
                    <BadgeCheck size={14} />
                    Verify
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {selectedSkill && (
        <VerifySkillModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onSubmitted={() => {
            setSelectedSkill(null);
            fetchAll();
          }}
        />
      )}
    </div>
  );
};

export default MyVerificationsPanel;

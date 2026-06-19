'use client'
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/lib/toast";
import { useParams } from "next/navigation";

interface Milestone {
  id: string;
  title: string;
  due_date: string | null;
  completed_at: string | null;
  skill_track_id: string;
  created_at: string;
  created_by: string;
}

function isOverdue(m: Milestone): boolean {
  if (m.completed_at || !m.due_date) return false;
  const due = new Date(m.due_date);
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function MilestonesPage() {
 const params = useParams()
  const workspaceId = params.id as string
  const { user } = useAuthStore();
  const { skillTracks } = useWorkspace(workspaceId);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    fetchMilestones();
  }, [workspaceId]);

  async function fetchMilestones() {
    const supabase = getSupabaseBrowserClient();
    setLoading(true);
    const { data } = await supabase
      .from("workspace_milestones")
      .select(
        "id, title, due_date, completed_at, skill_track_id, created_at, created_by",
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });
    setMilestones((data as Milestone[]) ?? []);
    setLoading(false);
  }

  async function toggleMilestone(m: Milestone) {
    const supabase = getSupabaseBrowserClient();
    const completed_at = m.completed_at ? null : new Date().toISOString();

    setMilestones((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, completed_at } : x)),
    );

    const { error } = await supabase
      .from("workspace_milestones")
      .update({ completed_at })
      .eq("id", m.id);

    if (error) {
      // revert on failure
      setMilestones((prev) =>
        prev.map((x) =>
          x.id === m.id ? { ...x, completed_at: m.completed_at } : x,
        ),
      );
      toast.error("Couldn't update milestone", "Please try again.");
      return;
    }

    if (completed_at) {
      toast.success("Milestone completed", "Nice progress!");
    }
  }

  async function addMilestone(trackId: string) {
    if (!newTitle.trim()) return;
    setSaving(true);
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("workspace_milestones")
      .insert({
        workspace_id: workspaceId,
        skill_track_id: trackId,
        created_by: user?.id,
        title: newTitle.trim(),
        due_date: newDueDate || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Couldn't add milestone", "Please try again.");
      setSaving(false);
      return;
    }

    setMilestones((prev) => [...prev, data as Milestone]);
    setNewTitle("");
    setNewDueDate("");
    setAdding(null);
    setSaving(false);
    toast.success("Milestone added", "It now shows up on this track.");
  }

  async function deleteMilestone(id: string) {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("workspace_milestones").delete().eq("id", id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    toast.success("Milestone removed", "");
  }

  const isMultiTrack = skillTracks.length > 1;

  return (
<>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">Milestones</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Track progress across each skill track
          </p>
        </div>

        <div
          className={`grid gap-5 ${isMultiTrack ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
        >
          {loading ? (
            <MilestonesSkeleton multiTrack={isMultiTrack} />
          ) : (
            skillTracks.map((track, i) => {
              const color = i === 0 ? "emerald" : "violet";
              const isTeacher = track.teacher_id === user?.id;
              const trackMilestones = milestones.filter(
                (m) => m.skill_track_id === track.id,
              );
              const done = trackMilestones.filter((m) => m.completed_at).length;
              const total = trackMilestones.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const overdueCount = trackMilestones.filter(isOverdue).length;

              return (
                <div
                  key={track.id}
                  className="bg-surface/50 rounded-2xl border border-text-primary/5 overflow-hidden flex flex-col"
                >
                  {/* Track header */}
                  <div
                    className={`px-5 py-4 border-b border-text-primary/5
                    ${color === "emerald" ? "bg-emerald-500/5" : "bg-violet-500/5"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full
                          ${color === "emerald" ? "bg-emerald-400" : "bg-violet-400"}`}
                        />
                        <p
                          className={`text-sm font-semibold
                          ${color === "emerald" ? "text-emerald-400" : "text-violet-400"}`}
                        >
                          {track.skills?.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {overdueCount > 0 && (
                          <span className="text-[11px] font-medium text-red-400 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">
                              error
                            </span>
                            {overdueCount} overdue
                          </span>
                        )}
                        <span
                          className={`text-xs ${color === "emerald" ? "text-emerald-400" : "text-violet-400"}`}
                        >
                          {done}/{total}
                        </span>
                      </div>
                    </div>
                    {total > 0 && (
                      <div className="mt-2.5 h-1.5 bg-text-primary/5 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500
                            ${color === "emerald" ? "bg-emerald-400" : "bg-violet-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Milestones list */}
                  <div className="divide-y divide-text-primary/5 flex-1">
                    {trackMilestones.length === 0 ? (
                      <div className="py-10 text-center">
                        <span className="material-symbols-outlined text-text-secondary/20 text-[28px]">
                          flag
                        </span>
                        <p className="text-sm text-text-secondary/50 mt-1">
                          No milestones yet
                        </p>
                      </div>
                    ) : (
                      trackMilestones.map((m) => {
                        const overdue = isOverdue(m);
                        return (
                          <div
                            key={m.id}
                            className="flex items-start gap-3 px-5 py-3 group"
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleMilestone(m)}
                              className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                                ${
                                  m.completed_at
                                    ? color === "emerald"
                                      ? "bg-emerald-400 border-emerald-400"
                                      : "bg-violet-400 border-violet-400"
                                    : overdue
                                      ? "border-red-400/60 hover:border-red-400"
                                      : "border-text-primary/15 hover:border-text-primary/30"
                                }`}
                            >
                              {m.completed_at && (
                                <span className="material-symbols-outlined text-[12px] text-white">
                                  check
                                </span>
                              )}
                            </button>

                            {/* Title + due date */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${m.completed_at ? "line-through text-text-secondary/40" : "text-text-primary"}`}
                              >
                                {m.title}
                              </p>
                              {m.due_date && (
                                <p
                                  className={`text-xs mt-0.5 flex items-center gap-1
                                  ${overdue ? "text-red-400" : "text-text-secondary/40"}`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {overdue ? "error" : "event"}
                                  </span>
                                  {overdue ? "Overdue" : "Due"}{" "}
                                  {formatDueDate(m.due_date)}
                                </p>
                              )}
                            </div>

                            {/* Delete (teacher only) */}
                            {isTeacher && (
                              <button
                                onClick={() => deleteMilestone(m.id)}
                                className="opacity-0 group-hover:opacity-100 text-text-secondary/30 hover:text-red-400 transition-all shrink-0"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  close
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {isTeacher && (
                    <div className="px-5 py-3 border-t border-text-primary/5">
                      {adding === track.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && addMilestone(track.id)
                            }
                            placeholder="Milestone title"
                            className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                          />
                          <input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2 text-sm text-text-secondary outline-none focus:ring-1 focus:ring-primary transition-all"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => addMilestone(track.id)}
                              disabled={!newTitle.trim() || saving}
                              className={`flex-1 text-sm py-1.5 rounded-xl text-white font-medium transition-colors disabled:opacity-40
                                ${color === "emerald" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-violet-500 hover:bg-violet-600"}`}
                            >
                              {saving ? "Adding…" : "Add"}
                            </button>
                            <button
                              onClick={() => {
                                setAdding(null);
                                setNewTitle("");
                                setNewDueDate("");
                              }}
                              className="flex-1 text-sm py-1.5 rounded-xl border border-text-primary/10 text-text-secondary hover:bg-text-primary/5 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAdding(track.id)}
                          className="flex items-center gap-1.5 text-xs text-text-secondary/50 hover:text-text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            add
                          </span>
                          Add milestone
                        </button>
                      )}
                    </div>
                  )}

                  {/* Non-teacher hint */}
                  {!isTeacher && trackMilestones.length === 0 && (
                    <div className="px-5 py-3 border-t border-text-primary/5">
                      <p className="text-xs text-text-secondary/40">
                        Your teacher hasn't added milestones for this track yet.
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────

function MilestonesSkeleton({ multiTrack }: { multiTrack: boolean }) {
  const count = multiTrack ? 2 : 1;
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-surface/50 rounded-2xl border border-text-primary/5 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-text-primary/5 animate-pulse">
            <div className="h-3 w-24 rounded-full bg-text-primary/5 mb-3" />
            <div className="h-1.5 w-full rounded-full bg-text-primary/5" />
          </div>
          <div className="divide-y divide-text-primary/5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-5 py-3 animate-pulse"
              >
                <div className="w-5 h-5 rounded-full bg-text-primary/5 shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3 w-2/3 rounded-full bg-text-primary/5" />
                  <div className="h-2.5 w-1/4 rounded-full bg-text-primary/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

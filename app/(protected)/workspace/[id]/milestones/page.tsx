'use client'
import { useContext, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/lib/toast";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";

import Error from '@material-symbols/svg-400/outlined/error.svg';
import Add from '@material-symbols/svg-400/outlined/add.svg';
import Check from '@material-symbols/svg-400/outlined/check.svg';
import Close from '@material-symbols/svg-400/outlined/close.svg';
import Flag from '@material-symbols/svg-400/outlined/flag.svg';
import Event from '@material-symbols/svg-400/outlined/event.svg';
import { SocketContext } from "@/providers/SocketContext";
import { Trash2 } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { logActivity } from "@/lib/activity";

interface Milestone {
  id: string;
  title: string;
  due_date: string | null;
  completed_at: string | null;
  skill_track_id: string;
  created_at: string;
  created_by: string;
}

interface SkillTrack {
  id: string;
  teacher_id: string;
  skills?: { title: string };
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
  const params = useParams();
  const workspaceId = params.id as string;
  const { user } = useAuthStore();
  const { skillTracks, members } = useWorkspace(workspaceId);
  const { socketReady } = useContext(SocketContext);
  const otherMember = members.find((m) => m.user_id !== user?.id);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTrack, setAddingTrack] = useState<SkillTrack | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);
  const [tooltipMilestoneId, setTooltipMilestoneId] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCheckboxClick(m: Milestone, isTeacher: boolean) {
    if (!isTeacher) {
      // learners can't toggle completion — show a tap-triggered tooltip
      // (hover alone doesn't reach mobile) explaining why, then auto-hide
      setTooltipMilestoneId(m.id);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(
        () => setTooltipMilestoneId(null),
        2200,
      );
      return;
    }
    toggleMilestone(m);
  }

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    fetchMilestones();
  }, [workspaceId]);

  useEffect(() => {
    if (!socketReady || !workspaceId) return;
    const socket = getSocket();

    function handleMilestoneAdded(milestone: Milestone) {
      setMilestones((prev) => {
        if (prev.some((m) => m.id === milestone.id)) return prev;
        return [...prev, milestone];
      });
    }

    function handleMilestoneUpdated(milestone: Milestone) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestone.id ? { ...m, ...milestone } : m)),
      );
    }

    function handleMilestoneDeleted({ milestoneId }: { milestoneId: string }) {
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    }

    socket?.on("workspace:milestone-added", handleMilestoneAdded);
    socket?.on("workspace:milestone-updated", handleMilestoneUpdated);
    socket?.on("workspace:milestone-deleted", handleMilestoneDeleted);
    return () => {
      socket?.off("workspace:milestone-added", handleMilestoneAdded);
      socket?.off("workspace:milestone-updated", handleMilestoneUpdated);
      socket?.off("workspace:milestone-deleted", handleMilestoneDeleted);
    };
  }, [socketReady, workspaceId]);

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
    const track = skillTracks.find((t) => t.id === m.skill_track_id);
    if (track?.teacher_id !== user?.id) {
      // defense in depth — the UI already routes learners to
      // handleCheckboxClick's tooltip branch instead of calling this
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const completed_at = m.completed_at ? null : new Date().toISOString();

    setMilestones((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, completed_at } : x)),
    );

    const { error } = await supabase
      .from("workspace_milestones")
      .update({ completed_at })
      .eq("id", m.id)
      .select('title, skill_track_id')

    if (error) {
      setMilestones((prev) =>
        prev.map((x) =>
          x.id === m.id ? { ...x, completed_at: m.completed_at } : x,
        ),
      );
      toast.error("Couldn't update milestone", "Please try again.");
      return;
    }

    if (socketReady) {
      const socket = getSocket();
      socket?.emit("workspace:milestone-updated", {
        workspaceId,
        milestoneId: m.id,
      });
    }

    if (user?.id) {
      const trackName = skillTracks.find(
        (t) => t.id === m.skill_track_id,
      )?.skills?.title;

      await logActivity(
        workspaceId,
        user.id,
        completed_at ? "milestone_completed" : "milestone_uncompleted",
        {
          milestone_title: m.title,
          skill: trackName,
        },
      );
    }

    if (completed_at) {
      toast.success("Milestone completed", "Nice progress!");
    } else {
      toast.success("Marked incomplete", "");
    }
  }

  function openAddModal(track: SkillTrack) {
    setNewTitle("");
    setNewDueDate("");
    setAddingTrack(track);
  }

  function closeAddModal() {
    if (saving) return;
    setAddingTrack(null);
    setNewTitle("");
    setNewDueDate("");
  }

  async function addMilestone() {
    if (!addingTrack || !newTitle.trim()) return;
    setSaving(true);
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("workspace_milestones")
      .insert({
        workspace_id: workspaceId,
        skill_track_id: addingTrack.id,
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

    if (socketReady) {
      const socket = getSocket();
      socket?.emit("workspace:milestone-added", {
        workspaceId,
        milestoneId: (data as Milestone).id,
      });
    }

    if (user?.id) {
      await logActivity(workspaceId, user.id, "milestone_added", {
        milestone_title: (data as Milestone).title,
        skill: addingTrack.skills?.title,
      });
    }

    setSaving(false);
    setAddingTrack(null);
    setNewTitle("");
    setNewDueDate("");
    toast.success("Milestone added", "It now shows up on this track.");
  }

  async function deleteMilestone(id: string) {
    const supabase = getSupabaseBrowserClient();
    setDeletingMilestoneId(id);

    // grab this before deleting — the row (and its title/track) won't be
    // fetchable anymore once the delete succeeds
    const target = milestones.find((m) => m.id === id);

    try {
      const { error } = await supabase
        .from("workspace_milestones")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Couldn't remove milestone", "Please try again.");
        return;
      }

      setMilestones((prev) => prev.filter((m) => m.id !== id));

      if (socketReady) {
        const socket = getSocket();
        socket?.emit("workspace:milestone-deleted", {
          workspaceId,
          milestoneId: id,
        });
      }

      if (user?.id && target) {
        const trackName = skillTracks.find(
          (t) => t.id === target.skill_track_id,
        )?.skills?.title;

        await logActivity(workspaceId, user.id, "milestone_deleted", {
          milestone_title: target.title,
          skill: trackName,
        });
      }

      toast.success("Milestone removed", "");

    } catch (error) {
      console.log(error)
      toast.error("Couldn't remove milestone", "Please try again.");
    } finally {
      setDeletingMilestoneId(null);
    }
  }

  const isMultiTrack = skillTracks.length > 1;
  const addingTrackColor =
    addingTrack && skillTracks[0]?.id === addingTrack.id ? "emerald" : "violet";

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Milestones</h1>
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
                            <Error className="w-3 h-3" />
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

                  <div className="divide-y divide-text-primary/5 flex-1 py-4">
                    {trackMilestones.length === 0 ? (
                      <div className="py-10 text-center">
                        <Flag className="w-7 h-7 text-text-secondary mx-auto" />
                        <p className="text-sm text-text-secondary mt-1">
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
                            <div className="relative mt-0.5 shrink-0">
                              <button
                                onClick={() => handleCheckboxClick(m, isTeacher)}
                                aria-disabled={!isTeacher}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                  ${m.completed_at
                                    ? color === "emerald"
                                      ? "bg-emerald-400 border-emerald-400"
                                      : "bg-violet-400 border-violet-400"
                                    : overdue
                                      ? "border-red-400/60 hover:border-red-400"
                                      : "border-text-primary/15 hover:border-text-primary/30"
                                  }
                                  ${!isTeacher ? "cursor-not-allowed opacity-70 hover:border-text-primary/15" : ""}`}
                              >
                                {m.completed_at && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </button>

                              {!isTeacher && (
                                <div
                                  role="tooltip"
                                  className={`pointer-events-none absolute left-0 top-6 z-10 w-max max-w-45 rounded-lg border border-text-primary/10 bg-surface px-2 py-1 text-[11px] text-text-secondary shadow-lg transition-opacity
                                    ${tooltipMilestoneId === m.id ? "opacity-100" : "opacity-0"}
                                    md:group-hover:opacity-100`}
                                >
                                  {`Only ${otherMember?.profiles?.name ?? "your teacher"} can mark this complete`}
                                </div>
                              )}
                            </div>

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
                                  {overdue ? <Error className="w-3 h-3" /> : <Event className="w-3 h-3" />}
                                  {overdue ? "Overdue" : "Due"}{" "}
                                  {formatDueDate(m.due_date)}
                                </p>
                              )}
                            </div>

                            <div className="h-full flex items-center justify-center">
                              {isTeacher && (
                                <button
                                  onClick={() => deleteMilestone(m.id)}
                                  className="md:opacity-0 md:group-hover:opacity-100 text-red-400 md:hover:text-red-400 transition-all shrink-0"
                                >
                                  {
                                    deletingMilestoneId === m.id ? (
                                      <Spinner size={20} />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )
                                  }

                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                  {isTeacher && (
                    <div className="px-5 py-3">
                      <button
                        onClick={() => openAddModal(track)}
                        className="flex items-center gap-1.5 w-full border justify-center border-primary/20 hover:bg-surface/20 py-3 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-xl"
                      >
                        <Add className="w-4 h-4" />
                        Add milestone
                      </button>
                    </div>
                  )}

                  {!isTeacher && trackMilestones.length === 0 && (
                    <div className="px-5 py-3 border-t border-text-primary/5">
                      <p className="text-sm text-text-secondary">
                        {`${otherMember?.profiles?.name} hasn't added milestones for this track yet.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {addingTrack && (
        <AddMilestoneModal
          trackTitle={addingTrack.skills?.title}
          color={addingTrackColor}
          title={newTitle}
          dueDate={newDueDate}
          saving={saving}
          onTitleChange={setNewTitle}
          onDueDateChange={setNewDueDate}
          onSubmit={addMilestone}
          onClose={closeAddModal}
        />
      )}
    </>
  );
}

function AddMilestoneModal({
  trackTitle,
  color,
  title,
  dueDate,
  saving,
  onTitleChange,
  onDueDateChange,
  onSubmit,
  onClose,
}: {
  trackTitle?: string;
  color: "emerald" | "violet";
  title: string;
  dueDate: string;
  saving: boolean;
  onTitleChange: (v: string) => void;
  onDueDateChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface border border-text-primary/10 rounded-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Add milestone
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary/50 hover:text-text-primary transition-colors"
          >
            <Close className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="milestone-track"
              className="text-xs font-medium text-text-secondary/70"
            >
              Track
            </label>
            <input
              id="milestone-track"
              type="text"
              value={trackTitle ?? ""}
              disabled
              className={`w-full rounded-xl bg-surface/40 border border-text-primary/10 px-3.5 py-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed
                ${color === "emerald" ? "text-emerald-400" : "text-violet-400"}`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="milestone-title"
              className="text-xs font-medium text-text-secondary/70"
            >
              Title
            </label>
            <input
              id="milestone-title"
              autoFocus
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Milestone title"
              className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="milestone-due-date"
              className="text-xs font-medium text-text-secondary/70"
            >
              Due date
            </label>
            <input
              id="milestone-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2 text-sm text-text-secondary outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={onSubmit}
              disabled={!title.trim() || saving}
              className={`flex-1 text-sm py-1.5 rounded-xl text-white font-medium transition-colors disabled:opacity-40
                ${color === "emerald" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-violet-500 hover:bg-violet-600"}`}
            >
              {saving ? "Adding…" : "Add"}
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 text-sm py-1.5 rounded-xl border border-text-primary/10 text-text-secondary hover:bg-text-primary/5 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
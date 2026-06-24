"use client";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import NewSessionModal from "@/components/workspace/sessions/NewSessionModal";
import { SessionsSkeleton } from "@/components/workspace/sessions/SessionSkeleton";
import UpcomingSessionsCard from "@/components/workspace/sessions/UpcomingSessionsCard";
import PastSessionCard from "@/components/workspace/sessions/PastSessionCard";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus } from "lucide-react";

interface Session {
  id: string;
  title: string;
  note: string | null;
  scheduled_at: string;
  duration: number | null;
  status:
    | "SCHEDULED"
    | "RINGING"
    | "ACTIVE"
    | "COMPLETED"
    | "MISSED"
    | "REJECTED"
    | "CANCELLED";
  skill_track_id: string | null;
  scheduled_by: string;
  type: "VIDEO" | "AUDIO";
  teacher_reschedule_count: number;
  reschedule_count: number;
  learner_reschedule_count: number;
  host_id: string;
}

export default function SessionsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { skillTracks, workspace } = useWorkspace(workspaceId);
  const { user } = useAuthStore();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState<string | "all">("all");
  const [showModal, setShowModal] = useState(false);

  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [rescheduling, setRescheduling] = useState<Session | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    fetchSessions();
  }, [workspaceId]);

  useEffect(() => {
    if (skillTracks.length > 0 && !selectedTrackId) {
      setSelectedTrackId(skillTracks[0].id);
    }
  }, [skillTracks]);

  async function fetchSessions() {
    const supabase = getSupabaseBrowserClient();
    setLoading(true);
    const { data } = await supabase
      .from("skill_sessions")
      .select(
        "id, scheduled_at, duration, status, skill_track_id, title, scheduled_by, host_id, type, note, reschedule_count, teacher_reschedule_count, learner_reschedule_count",
      )
      .eq("workspace_id", workspaceId)
      .order("scheduled_at", { ascending: true });
    setSessions((data as Session[]) ?? []);
    setLoading(false);
  }

  function getTrackName(trackId: string | null) {
    return skillTracks.find((t) => t.id === trackId)?.skills?.title ?? null;
  }

  const filtered =
    activeTrack === "all"
      ? sessions
      : sessions.filter((s) => s.skill_track_id === activeTrack);

  const active = filtered.filter((s) =>
    ["ACTIVE", "RINGING"].includes(s.status),
  );
  console.log(active, 'active')
  const upcoming = filtered.filter((s) => s.status === "SCHEDULED");
  const past = filtered.filter((s) =>
    ["COMPLETED", "MISSED", "REJECTED", "CANCELLED"].includes(s.status),
  );

  const handleReschedule = (id: string) => {
    const session = sessions.find((x) => x.id === id) ?? null;
    setRescheduling(session);
  };

  return (
    <>
      <div className="w-full min-h-full flex flex-col relative pb-24 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">
              Sessions
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage and schedule your skill sessions
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center justify-center gap-1.5 bg-primary/80 hover:bg-primary text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm h-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Schedule Session
          </button>
        </div>

        {skillTracks.length > 1 && (
          <div className="w-full flex items-center justify-center md:justify-start">
            <div className="flex gap-1.5 p-1 bg-surface/30 backdrop-blur-sm border border-surface/50 rounded-md w-max shadow-sm mt-10">
              <button
                onClick={() => setActiveTrack("all")}
                className={`text-sm font-medium px-4 py-1.5 rounded-md transition-all duration-200 ${
                  activeTrack === "all"
                    ? "bg-primary text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                }`}
              >
                All
              </button>

              {skillTracks.map((track) => {
                const isActive = activeTrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => setActiveTrack(track.id)}
                    className={`text-sm font-medium px-4 py-1.5 rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                    }`}
                  >
                    {track.skills?.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="w-full gap-10 mt-10">
          {active.length > 0 && (
            <div className="flex flex-col gap-3 w-full mb-15">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Now
              </p>
              <div className="flex flex-col gap-4 w-full">
                {active.map((s) => {
                  const date = new Date(s.scheduled_at);
                  return (
                    <UpcomingSessionsCard
                      key={s.id}
                      s={s}
                      date={date}
                      isHost={s.host_id === user?.id}
                      getTrackName={getTrackName}
                      showRescheduleBtn={false}
                      onJoin={(id) => {
                        const route = s.type === "VIDEO" ? "video" : "audio";
                        router.push(`/sessions/${route}/${id}/preview`);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <SessionsSkeleton />
          ) : (
            <div className="flex flex-col gap-15 w-full">
              {upcoming.length > 0 && (
                <div className="flex flex-col gap-3 w-full">
                  <p className="text-xl font-bold text-text-primary">
                    Upcoming Sessions
                  </p>
                  <div className="flex flex-col gap-4 w-full">
                    {upcoming.map((s) => {
                      const date = new Date(s.scheduled_at);

                      return (
                        <UpcomingSessionsCard
                          key={s.id}
                          s={s}
                          date={date}
                          isHost={s.host_id === user?.id}
                          getTrackName={getTrackName}
                          onReschedule={handleReschedule}
                          onJoin={(id) => {
                            const route =
                              s.type === "VIDEO" ? "video" : "audio";
                            router.push(`/sessions/${route}/${id}/preview`);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div className="flex flex-col gap-3 w-full">
                  <p className="text-xl font-bold text-text-primary">
                    Past Sessions
                  </p>
                  <div className="flex flex-col gap-4 w-full">
                    {past.map((s) => {
                      return (
                        <PastSessionCard
                          s={s}
                          getTrackName={getTrackName}
                          key={s.id}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 py-16 text-center max-w-xl mx-auto w-full mt-6">
                  <span
                    className="material-symbols-outlined text-text-secondary mb-4 select-none"
                    style={{ fontSize: "4rem" }}
                    aria-hidden="true"
                  >
                    calendar_add_on
                  </span>

                  <h3 className="text-xl font-bold text-text-primary mb-1">
                    You have no sessions yet
                  </h3>

                  <p className="text-text-secondary mb-6 text-sm max-w-sm">
                    Create your first session to get started with your scheduled
                    workspace activities.
                  </p>

                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary text-text-primary px-5 py-3 text-sm font-semibold shadow-md transition-all hover:opacity-90 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-xl">
                      calendar_add_on
                    </span>
                    <span>Schedule Session</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:hidden fixed bottom-20 right-6 z-40">
          <button
            onClick={() => setShowModal(true)}
            aria-label="Schedule new session"
            className="bg-primary hover:bg-primary/90 text-text-primary p-4 rounded-full shadow-xl transition-all duration-200 active:scale-95 hover:scale-105 flex items-center justify-center border border-white/10"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {(showModal || rescheduling) && (
        <NewSessionModal
          workspaceId={workspaceId}
          proposalId={workspace?.proposal?.id || ""}
          skillTracks={skillTracks}
          defaultDuration={workspace?.proposal?.session_duration_minutes}
          onClose={() => {
            setShowModal(false);
            setRescheduling(null);
          }}
          existingSessions={sessions}
          onCreated={(updated) => {
            setSessions((prev) => {
              const exists = prev.some((s) => s.id === updated.id);
              if (exists) {
                return prev.map((s) => (s.id === updated.id ? updated : s));
              }
              return [...prev, updated];
            });
          }}
          rescheduleSession={rescheduling}
        />
      )}
    </>
  );
}
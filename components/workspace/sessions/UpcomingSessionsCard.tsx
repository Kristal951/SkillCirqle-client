import { useNow } from "@/hooks/useNow";
import { getSessionPhase } from "@/utils/sessionUseNow";
import React from "react";

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
}

interface UpcomingSessionsCardProps {
  s: Session;
  date: Date;
  getTrackName: (trackId: string | null) => string | null;
  onReschedule?: (id: string) => void;
  showRescheduleBtn?: boolean;
  onJoin?: (id: string) => void;
  isHost?: boolean;
}

const UpcomingSessionsCard = ({
  s,
  date,
  getTrackName,
  onReschedule,
  showRescheduleBtn = true,
  isHost,
  onJoin,
}: UpcomingSessionsCardProps) => {
  const now = useNow(15000);
  const trackName = getTrackName(s.skill_track_id);
  const totalReschedules =
    (s.teacher_reschedule_count ?? 0) + (s.learner_reschedule_count ?? 0);
  const phase = getSessionPhase(s.scheduled_at, now);

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-surface/50 hover:bg-surface/80 rounded-xl transition-all duration-300 border border-text-primary/5 hover:border-text-primary/10 hover:shadow-xl hover:shadow-primary/5">
      
      {/* Date Box Indicator */}
      <div className="flex sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 px-4 py-2.5 sm:py-3 sm:w-20 bg-background rounded-xl border border-text-primary/5 shadow-inner transition-colors duration-300 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-bold">
          {date.toLocaleDateString("en-GB", { month: "short" })}
        </span>
        <span className="text-xl sm:text-2xl font-black text-text-primary leading-none">
          {date.getDate()}
        </span>
      </div>

      {/* Info Body */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text-primary mb-1.5 wrap-break-word line-clamp-2 sm:truncate">
          {s.title}
        </h3>

        {/* Metadata Badges & Dividers */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-text-secondary">
          {trackName && (
            <span className="font-bold text-[10px] uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
              {trackName}
            </span>
          )}

          {s.duration && (
            <div className="flex items-center gap-1">
              {trackName && <span className="opacity-20 mr-1 sm:inline hidden">|</span>}
              <span className="material-symbols-outlined text-sm opacity-70">timer</span>
              <span>{s.duration} mins</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="opacity-20 mr-1 sm:inline hidden">|</span>
            <span className="material-symbols-outlined text-sm opacity-70">schedule</span>
            <span>
              {date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          {s.type && (
            <div className="flex items-center gap-1">
              <span className="opacity-20 mr-1 sm:inline hidden">|</span>
              <span className="material-symbols-outlined text-sm opacity-70">
                {s.type === "VIDEO" ? "videocam" : "mic"}
              </span>
              <span className="capitalize">{s.type.toLowerCase()}</span>
            </div>
          )}

          {totalReschedules > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-accent">
              <span className="opacity-20 mr-1 text-text-secondary sm:inline hidden">|</span>
              <span className="material-symbols-outlined text-sm">event_repeat</span>
              <span>
                Rescheduled{" "}
                {totalReschedules === 1
                  ? "once"
                  : totalReschedules === 2
                    ? "twice"
                    : `${totalReschedules} times`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 mt-2 sm:mt-0 w-full sm:w-auto pt-3 sm:pt-0 border-t border-text-primary/5 sm:border-none flex items-center justify-end">
        {phase === "joinable" ? (
          <button
            type="button"
            onClick={() => onJoin?.(s.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-semibold w-full sm:w-auto animate-pulse"
          >
            <span className="material-symbols-outlined text-lg">
              {s.type === "VIDEO" ? "videocam" : "mic"}
            </span>
            <span>{isHost ? "Start Session" : "Join Session"}</span>
          </button>
        ) : phase === "missed" ? (
          <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 w-full sm:w-auto">
            <span className="material-symbols-outlined text-sm">event_busy</span>
            Session Missed
          </span>
        ) : (
          showRescheduleBtn && (
            <button
              type="button"
              onClick={() => onReschedule?.(s.id)}
              className="bg-background hover:bg-primary/10 text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 px-4 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-medium w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span>Reschedule</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default UpcomingSessionsCard;
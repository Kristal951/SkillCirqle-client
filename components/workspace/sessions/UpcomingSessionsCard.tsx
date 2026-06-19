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
    <div className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 bg-surface/50 hover:bg-surface/80 rounded-xl transition-all duration-500 border border-transparent hover:border-text-primary/10 hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0 px-4 py-3 sm:w-20 bg-background rounded-2xl border border-text-primary/5 shadow-inner transition-colors duration-500 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold">
          {date.toLocaleDateString("en-GB", { month: "short" })}
        </span>
        <span className="text-2xl sm:text-3xl font-black text-text-primary leading-none">
          {date.getDate()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-text-primary mb-1 transition-colors duration-300 truncate">
            {s.title}
          </h3>
        </div>

        <div className="flex items-center gap-x-2.5 gap-y-1.5 text-xs text-text-secondary flex-wrap">
          {trackName && (
            <div className="flex items-center gap-1.5">
              {/* <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-accent" /> */}
              <span className="font-bold text-[10px] uppercase tracking-wide text-accent">
                {trackName}
              </span>
            </div>
          )}

          {s.duration && (
            <>
              {trackName && <span className="opacity-30">|</span>}
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm opacity-80">
                  timer
                </span>
                <span>{s.duration} mins</span>
              </div>
            </>
          )}

          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm opacity-80">
              schedule
            </span>
            <span>
              {date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          {s.type && (
            <>
              <span className="opacity-30">|</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm opacity-80">
                  {s.type === "VIDEO" ? "videocam" : "mic"}
                </span>
                <span className="capitalize">{s.type.toLowerCase()}</span>
              </div>
            </>
          )}

          {totalReschedules > 0 && (
            <>
              <span className="opacity-30">|</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-accent">
                <span className="material-symbols-outlined text-sm">
                  event_repeat
                </span>
                <span>
                  Rescheduled{" "}
                  {totalReschedules === 1
                    ? "once"
                    : totalReschedules === 2
                      ? "twice"
                      : `${totalReschedules} times`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 mt-2 sm:mt-0 flex items-center justify-end gap-2">
        {phase === "joinable" ? (
          <button
            type="button"
            onClick={() => onJoin?.(s.id)}
            className="bg-emerald-500 px-4 py-2 gap-2 rounded-lg flex items-center justify-center text-white hover:bg-emerald-600 transition-all duration-300 active:scale-95 text-sm font-semibold w-full sm:w-auto animate-pulse"
          >
            <span className="material-symbols-outlined text-lg">
              {s.type === "VIDEO" ? "videocam" : "mic"}
            </span>
            {isHost ? "Start session" : "Join session"}
          </button>
        ) : phase === "missed" ? (
          <span className="text-xs text-rose-500 px-3 py-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">
              event_busy
            </span>
            Session Missed
          </span>
        ) : (
          showRescheduleBtn && (
            <button
              type="button"
              onClick={() => onReschedule?.(s.id)}
              className="bg-background px-3 py-2 gap-2 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary hover:bg-primary/10 transition-all duration-300 active:scale-95 text-sm font-medium w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-lg">
                calendar_today
              </span>
              Reschedule
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default UpcomingSessionsCard;

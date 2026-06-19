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

type SessionStatus = Session["status"];

const statusMap: Record<
  SessionStatus,
  { color: string; bg: string; border: string; icon: string }
> = {
  COMPLETED: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "check_circle",
  },
  MISSED: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: "event_busy",
  },
  REJECTED: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "block",
  },
  CANCELLED: {
    color: "text-text-secondary",
    bg: "bg-text-secondary/10",
    border: "border-text-secondary/20",
    icon: "cancel",
  },
  SCHEDULED: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "schedule",
  },
  RINGING: {
    color: "text-accent-400",
    bg: "bg-accent/10",
    border: "border-accent/20",
    icon: "call",
  },
  ACTIVE: {
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "play_circle",
  },
};

interface Props {
  s: Session;
  getTrackName: (id: string | null) => string | null;
}

const PastSessionCard = ({ s, getTrackName }: Props) => {
  const status = statusMap[s.status] ?? statusMap.CANCELLED;
  const trackName = getTrackName(s.skill_track_id);

  const formattedDate = new Date(s.scheduled_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const date = new Date(s.scheduled_at);

  return (
    <div className="flex items-center justify-between p-4 bg-surface/40 hover:bg-surface/60 rounded-xl border border-text-primary/5 transition-all duration-300 gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-xl border ${status.bg} ${status.border} shrink-0`}
        >
          <span className={`material-symbols-outlined text-xl ${status.color}`}>
            {status.icon}
          </span>
        </div>

        <div className="flex flex-col min-w-0 gap-1 flex-1">
          <h5 className="text-base font-semibold text-text-primary truncate">
            {s.title}
          </h5>

          <div className="flex items-center gap-x-2.5 gap-y-1 text-xs text-text-secondary flex-wrap">
            {trackName && (
              <div className="flex items-center">
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
              <span>{formattedDate}</span>
              <span className="w-1 h-1 rounded-full bg-text-secondary" />
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
          </div>
        </div>
      </div>

      <span
        className={`text-[10px] font-bold tracking-wider uppercase ${status.color}`}
      >
        {s.status.toLowerCase()}
      </span>
    </div>
  );
};

export default PastSessionCard;

// Integrate the OneSignal Web SDK into this codebase.

// Follow the instructions at: https://documentation.onesignal.com/docs/en/web-sdk-setup

// App ID: b60cad30-7dce-4363-86d5-a8283b708917

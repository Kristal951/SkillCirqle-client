"use client";
import { useNow } from "@/hooks/useNow";
import { getSessionPhase } from "@/utils/sessionUseNow";
import { useSessionResources } from "@/hooks/useSessionResources";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import Timer from "@material-symbols/svg-400/outlined/timer.svg";
import Schedule from "@material-symbols/svg-400/outlined/schedule.svg";
import Videocam from "@material-symbols/svg-400/outlined/video_camera_back.svg";
import Mic from "@material-symbols/svg-400/outlined/mic.svg";
import EventRepeat from "@material-symbols/svg-400/outlined/event_repeat.svg";
import EventBusy from "@material-symbols/svg-400/outlined/event_busy.svg";
import CalendarToday from "@material-symbols/svg-400/outlined/calendar_today.svg";
import AttachFile from "@material-symbols/svg-400/outlined/attach_file.svg";
import Link from "@material-symbols/svg-400/outlined/link.svg";
import StickyNote from "@material-symbols/svg-400/outlined/sticky_note_2.svg";
import Description from "@material-symbols/svg-400/outlined/description.svg";

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
  workspaceId: string;
  getTrackName: (trackId: string | null) => string | null;
  onReschedule?: (id: string) => void;
  showRescheduleBtn?: boolean;
  onJoin?: (id: string) => void;
  isHost?: boolean;
}

const resourceIcon = (type: string) => {
  if (type === "link") return Link;
  if (type === "note") return StickyNote;
  return Description;
};

const resourceLabel = (r: {
  type: string;
  file_title: string | null;
  file_name: string | null;
  link_title: string | null;
  note_title: string | null;
  url: string | null;
}) => {
  if (r.type === "file") return r.file_title || r.file_name || "Untitled file";
  if (r.type === "link") return r.link_title || r.url || "Untitled link";
  return r.note_title || "Untitled note";
};

// Small consistent separator, replacing the scattered manual "|" spans
const Dot = () => (
  <span className="w-1 h-1 rounded-full bg-text-secondary/25 shrink-0" />
);

const UpcomingSessionsCard = ({
  s,
  date,
  workspaceId,
  getTrackName,
  onReschedule,
  showRescheduleBtn = true,
  isHost,
  onJoin,
}: UpcomingSessionsCardProps) => {
  const now = useNow(15000);
  const router = useRouter();
  const trackName = getTrackName(s.skill_track_id);
  const totalReschedules =
    (s.teacher_reschedule_count ?? 0) + (s.learner_reschedule_count ?? 0);
  const phase = getSessionPhase(s.scheduled_at, now);

  const { resources, loading: resourcesLoading } = useSessionResources(s.id);
  const [showResources, setShowResources] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showResources) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) {
        setShowResources(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResources]);

  const handleResourceClick = (r: (typeof resources)[number]) => {
    setShowResources(false);

    if (r.type === "link" && r.url) {
      window.open(r.url, "_blank");
      return;
    }

    router.push(`/workspace/${workspaceId}/resources?highlight=${r.id}`);
  };

  const TypeIcon = s.type === "VIDEO" ? Videocam : Mic;

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-stretch gap-4 p-4 sm:p-5 bg-surface/50 hover:bg-surface/80 rounded-xl transition-all duration-300 border border-text-primary/5 hover:border-text-primary/10 hover:shadow-xl hover:shadow-primary/5">
      {/* Date badge */}
      <div className="flex sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 px-4 py-2.5 sm:py-3 sm:w-20 bg-background rounded-xl border border-text-primary/5 shadow-inner shrink-0">
        <span className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-bold">
          {date.toLocaleDateString("en-GB", { month: "short" })}
        </span>
        <span className="text-xl sm:text-2xl font-black text-text-primary leading-none">
          {date.getDate()}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5">
        <div className="flex items-start gap-2">
          <h3 className="text-base font-semibold text-text-primary wrap-break-word line-clamp-2 sm:truncate flex-1">
            {s.title}
          </h3>
          {trackName && (
            <span className="shrink-0 font-bold text-[10px] uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-md">
              {trackName}
            </span>
          )}
        </div>

        {/* Facts row: time, duration, type — always together, no manual dividers */}
        <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
          <div className="flex items-center gap-1">
            <Schedule className="text-sm opacity-60" />
            <span>
              {date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          {s.duration && (
            <div className="flex items-center gap-1">
              <Timer className="text-sm opacity-60" />
              <span>{s.duration} mins</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <TypeIcon className="text-sm opacity-60" />
            <span className="capitalize">{s.type.toLowerCase()}</span>
          </div>
        </div>

        {/* Secondary row: reschedule note + resources, only when present */}
        {(totalReschedules > 0 || (!resourcesLoading && resources.length > 0)) && (
          <div className="flex items-center gap-3 flex-wrap">
            {totalReschedules > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                <EventRepeat className="text-sm" />
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

            {totalReschedules > 0 && !resourcesLoading && resources.length > 0 && <Dot />}

            {!resourcesLoading && resources.length > 0 && (
              <div className="relative" ref={popoverRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowResources((v) => !v);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-full transition-colors"
                >
                  <AttachFile className="text-sm" />
                  <span>
                    {resources.length} resource{resources.length === 1 ? "" : "s"}
                  </span>
                </button>

                {showResources && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-border bg-surface shadow-2xl z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Resources for this session
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {resources.map((r) => {
                        const Icon = resourceIcon(r.type);
                        return (
                          <button
                            key={r.id}
                            onClick={() => handleResourceClick(r)}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-background transition-colors"
                          >
                            <Icon className="text-text-secondary text-[15px] shrink-0" />
                            <span className="text-xs text-text-primary truncate">
                              {resourceLabel(r)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action area */}
      <div className="shrink-0 flex items-center sm:items-stretch mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-text-primary/5 sm:border-none sm:border-l sm:pl-5">
        <div className="w-full sm:w-auto flex items-center justify-end">
          {phase === "joinable" ? (
            <button
              type="button"
              onClick={() => onJoin?.(s.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-semibold w-full sm:w-auto animate-pulse"
            >
              <TypeIcon className="text-lg" />
              <span>{isHost ? "Start Session" : "Join Session"}</span>
            </button>
          ) : phase === "preview" ? (
            <button
              type="button"
              onClick={() => onJoin?.(s.id)}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-5 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-semibold w-full sm:w-auto"
            >
              <TypeIcon className="text-lg" />
              <span>{isHost ? "Get Ready" : "Join"}</span>
            </button>
          ) : phase === "missed" ? (
            <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 w-full sm:w-auto">
              <EventBusy className="text-lg" />
              Session Missed
            </span>
          ) : (
            showRescheduleBtn && (
              <button
                type="button"
                onClick={() => onReschedule?.(s.id)}
                className="bg-background hover:bg-primary/10 text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 px-4 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-medium w-full sm:w-auto"
              >
                <CalendarToday className="text-lg" />
                <span>Reschedule</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingSessionsCard;
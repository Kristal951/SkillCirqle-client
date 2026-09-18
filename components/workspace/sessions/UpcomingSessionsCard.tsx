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

    router.push(`/workspaces/${workspaceId}/resources?highlight=${r.id}`);
  };

  const TypeIcon = s.type === "VIDEO" ? Videocam : Mic;
  const isLive = phase === "joinable";

  return (
    <div
      className={`
        group relative flex flex-col sm:flex-row
        bg-surface/50 rounded-2xl border transition-all duration-300
        ${isLive
          ? "border-primary/30 shadow-lg shadow-primary/10"
          : "border-border/5 hover:border-border/10 hover:shadow-xl hover:shadow-black/20"
        }
      `}
    >

      <div className="relative flex sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-0.5 px-5 py-4 sm:w-24 shrink-0">
        <span className="text-[10px] tracking-widest text-text-secondary/70 font-semibold">
          {date.toLocaleDateString("en-GB", { month: "short" })}
        </span>
        <span className="text-2xl sm:text-[28px] font-black text-text-primary leading-none tabular-nums">
          {date.getDate()}
        </span>
        <span className="hidden sm:block text-[10px] text-text-secondary/50 mt-0.5">
          {date.toLocaleDateString("en-GB", { weekday: "short" })}
        </span>
      </div>

      <div className="relative hidden sm:block w-px shrink-0">
        <div className="absolute inset-y-3 left-0 border-l border-dashed border-border" />
        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-background" />
        <div className="absolute -left-1.5 -bottom-1.5 w-3 h-3 rounded-full bg-background" />
      </div>
      <div className="sm:hidden border-t border-dashed border-border/10 mx-4" />

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5 px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-text-primary wrap-break-word line-clamp-2 sm:truncate flex-1">
            {s.title}
          </h3>
        </div>

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

        {(totalReschedules > 0 || resourcesLoading || resources.length > 0) && (
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

            {totalReschedules > 0 && (resourcesLoading || resources.length > 0) && <Dot />}

            {resourcesLoading && (
              <div className="h-6.5 w-24 rounded-full bg-white/5 animate-pulse" />
            )}

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
                      <p className="text-[11px] font-semibold text-text-secondary">
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

      <div className="shrink-0 flex items-center px-5 pb-4 sm:pb-0 sm:pr-5 sm:pl-0">
        <div className="h-full flex items-center mr-6">
           {trackName && (
            <span className="shrink-0 text-[11px] font-medium text-accent bg-accent/10 px-2 py-1 rounded-md">
              {trackName}
            </span>
          )}
        </div>
        <div className="w-full sm:w-auto flex items-center justify-end">
          {phase === "joinable" ? (
            <button
              type="button"
              onClick={() => onJoin?.(s.id)}
              className="relative bg-primary hover:bg-primary/90 text-white pl-4 pr-5 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-semibold w-full sm:w-auto"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span>{isHost ? "Start session" : "Join session"}</span>
            </button>
          ) : phase === "preview" ? (
            <button
              type="button"
              onClick={() => onJoin?.(s.id)}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-4 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-semibold w-full sm:w-auto"
            >
              <TypeIcon className="text-lg" />
              <span>{isHost ? "Get ready" : "Join"}</span>
            </button>
          ) : phase === "missed" ? (
            <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 w-full sm:w-auto">
              <EventBusy className="text-base" />
              Missed
            </span>
          ) : (
            showRescheduleBtn && (
              <button
                type="button"
                onClick={() => onReschedule?.(s.id)}
                className="text-text-secondary hover:text-text-primary hover:bg-white/5 border border-white/10 hover:border-white/15 px-3.5 py-2.5 gap-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 text-sm font-medium w-full sm:w-auto"
              >
                <CalendarToday className="text-base" />
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
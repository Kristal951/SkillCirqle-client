"use client";
import React from "react";
import { useNow } from "@/hooks/useNow";
import HistoryToggleOff from "@material-symbols/svg-400/outlined/history_toggle_off.svg"
import CalendarToday from "@material-symbols/svg-400/outlined/calendar_today.svg"
import EventRepeat from "@material-symbols/svg-400/outlined/event_repeat.svg"
import TaskAlt from "@material-symbols/svg-400/outlined/task_alt.svg"
import EventBusy from "@material-symbols/svg-400/outlined/event_busy.svg"
import Flag from "@material-symbols/svg-400/outlined/flag.svg"
import MilitaryTech from "@material-symbols/svg-400/outlined/military_tech.svg"
import FolderOpen from "@material-symbols/svg-400/outlined/folder_open.svg"
import Delete from "@material-symbols/svg-400/outlined/delete.svg"
import Undo from "@material-symbols/svg-400/outlined/undo.svg"
import { IconType } from "@/utils/SvgType";

export type ActivityType =
  | "session_scheduled"
  | "session_rescheduled"
  | "session_completed"
  | "session_cancelled"
  | "milestone_added"
  | "milestone_completed"
  | "milestone_uncompleted"
  | "milestone_deleted"
  | "resource_added"
  | "resource_removed";

export interface Activity {
  id: string;
  type: ActivityType;
  created_at: string;
  metadata: {
    session_title?: string;
    milestone_title?: string;
    resource_name?: string;
    skill?: string;
  };
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

const ICONS: Record<ActivityType, IconType> = {
  session_scheduled: CalendarToday,
  session_rescheduled: EventRepeat,
  session_completed: TaskAlt,
  session_cancelled: EventBusy,
  milestone_added: MilitaryTech,
  milestone_completed: MilitaryTech,
  milestone_uncompleted: Undo,
  milestone_deleted: Delete,
  resource_added: FolderOpen,
  resource_removed: Delete,
};

const COLORS: Record<ActivityType, string> = {
  session_scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  session_rescheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  session_completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  session_cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  milestone_added: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  milestone_completed:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  milestone_uncompleted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  milestone_deleted: "bg-red-500/10 text-red-400 border-red-500/20",
  resource_added: "bg-primary/10 text-primary border-primary/20",
  resource_removed: "bg-red-500/10 text-red-400 border-red-500/20",
};

function activityLabel(item: Activity): React.ReactNode {
  const name = item.profiles?.name?.split(" ")[0] ?? "Someone";
  const m = item.metadata;

  switch (item.type) {
    case "session_scheduled":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span>{" "}
          scheduled{" "}
          <span className="font-medium text-text-primary">
            "{m.session_title}"
          </span>{" "}
          session
        </>
      );
    case "session_rescheduled":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span>{" "}
          rescheduled{" "}
          <span className="font-medium text-text-primary">
            "{m.session_title}"
          </span>{" "}
          session
        </>
      );
    case "session_completed":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span>{" "}
          completed{" "}
          <span className="font-medium text-text-primary">
            "{m.session_title}"
          </span>
        </>
      );
    case "session_cancelled":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span>{" "}
          cancelled a session
        </>
      );
    case "milestone_added":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span> added
          milestone{" "}
          <span className="font-medium text-text-primary">
            "{m.milestone_title}"
          </span>
        </>
      );
    case "milestone_completed":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span>{" "}
          completed{" "}
          <span className="font-medium text-text-primary">
            "{m.milestone_title}"
          </span>
        </>
      );
    case "milestone_uncompleted":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span>{" "}
          marked{" "}
          <span className="font-medium text-text-primary">
            "{m.milestone_title}"
          </span>{" "}
          incomplete
        </>
      );
    case "milestone_deleted":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span>{" "}
          removed milestone{" "}
          <span className="font-medium text-text-primary">
            "{m.milestone_title}"
          </span>
        </>
      );
    case "resource_added":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span> added
          resource{" "}
          <span className="font-medium text-text-primary">
            "{m.resource_name}"
          </span>
        </>
      );
    case "resource_removed":
      return (
        <>
          <span className="font-medium text-text-primary">{name}</span> removed
          resource{" "}
          <span className="font-medium text-text-primary">
            "{m.resource_name}"
          </span>
        </>
      );
    default:
      return "Activity recorded";
  }
}

interface ActivityFeedProps {
  activity: Activity[];
  loading: boolean;
}

export default function ActivityFeed({ activity, loading }: ActivityFeedProps) {
  const now = useNow();

  function timeAgo(dateStr: string): string {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-text-primary/5 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-3/4 rounded-md bg-text-primary/5" />
              <div className="h-2.5 w-1/4 rounded-md bg-text-primary/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <HistoryToggleOff className="text-text-secondary mb-1 text-[40px]"/>
        <p className="text-xs text-text-secondary">
          No history activity logged yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {activity.map((item, i) => {
        const isLast = i === activity.length - 1;
        const Icon = ICONS[item.type]
        return (
          <div key={item.id} className="flex gap-3 py-1 group relative">
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 z-10 ${COLORS[item.type] ?? "bg-text-primary/5 text-text-secondary border-transparent"}`}
              >
                <Icon className="text-[15px]"/>
              </div>

              {!isLast && (
                <div className="w-px flex-1 bg-text-primary/15 group-hover:bg-text-primary/25 transition-colors my-1" />
              )}
            </div>

            <div className={`flex-1 min-w-0 ${!isLast ? "pb-5" : "pb-1"}`}>
              <div className="text-xs text-text-secondary leading-relaxed pt-1.5">
                {activityLabel(item)}
                {/* {item.metadata?.skill && (
                  <span className="ml-1.5 font-semibold text-accent inline-flex items-center bg-accent/5 px-1.5 py-0.2 rounded text-[10px] uppercase tracking-wider">
                    {item.metadata.skill}
                  </span>
                )} */}
              </div>
              <p className="text-[11px] text-text-secondary/40 mt-1">
                {timeAgo(item.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
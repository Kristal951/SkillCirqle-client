"use client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";
import DataCard from "@/components/workspace/overview/DataCard";
import SessionCardSkeleton from "@/components/workspace/overview/SkeletonLoaderForDataCard";
import ActivityFeed from "@/components/workspace/overview/ActivityFeed";
import { useWorkspaceActivity } from "@/hooks/useWorkspaceActivity";
import UpcomingSessionsCard from "@/components/workspace/sessions/UpcomingSessionsCard";
import Link from "next/link";
import Timer from "@material-symbols/svg-400/outlined/timer.svg";
import CalendarToday from "@material-symbols/svg-400/outlined/calendar_today.svg";
import MilitaryTech from "@material-symbols/svg-400/outlined/military_tech.svg";
import CalendarAddOn from "@material-symbols/svg-400/outlined/calendar_add_on.svg";
import Resources from "@/components/workspace/overview/Resources";
import { getSocket } from "@/lib/socket";
import { SocketContext } from "@/providers/SocketContext";

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
  reschedule_count: number;
  teacher_reschedule_count: number;
  learner_reschedule_count: number;
}

interface RecentMilestone {
  id: string;
  title: string;
  completed_at: string | null;
  skill_track_id: string;
}

export default function WorkspaceOverview() {
  const params = useParams();
  const id = params.id as string;
  const { workspace, skillTracks, loading } = useWorkspace(id);
  const { socketReady } = useContext(SocketContext);

  const { activity, loading: activityLoading } = useWorkspaceActivity(id, 5);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [milestones, setMilestones] = useState<RecentMilestone[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);

  function getTrackName(trackId: string | null) {
    return skillTracks.find((t) => t.id === trackId)?.skills?.title ?? null;
  }

  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetchOverviewData();
  }, [id]);

  useEffect(() => {
    if (!socketReady || !id) return;
    const socket = getSocket();

    function handleMilestoneAdded(milestone: RecentMilestone) {
      setMilestones((prev) => {
        if (prev.some((m) => m.id === milestone.id)) return prev;
        return [...prev, milestone];
      });
    }

    function handleMilestoneUpdated(milestone: RecentMilestone) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestone.id ? { ...m, ...milestone } : m)),
      );
    }

    function handleMilestoneDeleted({
      milestoneId,
    }: {
      milestoneId: string;
    }) {
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
  }, [socketReady, id]);

  async function fetchOverviewData() {
    setOverviewLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { data: sess } = await supabase
      .from("skill_sessions")
      .select("id, title, scheduled_at, status, skill_track_id, duration, type")
      .eq("workspace_id", id)
      .order("scheduled_at", { ascending: true });

    const { data: miles } = await supabase
      .from("workspace_milestones")
      .select("id, title, completed_at, skill_track_id")
      .eq("workspace_id", id)
      .order("created_at", { ascending: true });

    setSessions((sess as Session[]) ?? []);
    setMilestones((miles as RecentMilestone[]) ?? []);
    setOverviewLoading(false);
  }

  const completedMilestones = milestones.filter((m) => m.completed_at);
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED");

  // const expectedNumberOfSessions =
  //   workspace?.proposal?.expected_number_of_sessions;

  const cardData = [
    {
      label: "Sessions done",
      value: completedSessions.length,
      // subValue: expectedNumberOfSessions,
      icon: Timer,
    },
    {
      label: "Upcoming Session",
      value: upcomingSessions[0]
        ? new Date(upcomingSessions[0].scheduled_at).toLocaleDateString(
            "en-GB",
            { weekday: "short", day: "numeric", month: "short" },
          )
        : "None",
      subValue: upcomingSessions[0]
        ? new Date(upcomingSessions[0].scheduled_at).toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            },
          )
        : null,
      icon: CalendarToday,
      compact: true,
    },
    {
      label: "Milestones completed",
      value: completedMilestones.length,
      subValue: milestones.length,
      icon: MilitaryTech,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))
          : cardData.map((data, i) => (
              <DataCard
                key={i}
                icon={data.icon}
                label={data.label}
                value={data.value}
                subValue={data.subValue}
                compact={data.compact}
              />
            ))}
      </div>

      {/* <div
        className={`grid gap-4 mb-6 ${isSwap ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {skillTracks.map((track, i) => {
          const color = i === 0 ? "emerald" : "violet";
          const trackMilestones = milestones.filter(
            (m) => m.skill_track_id === track.id,
          );
          const done = trackMilestones.filter((m) => m.completed_at).length;
          const total = trackMilestones.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const teacherName = members
            .find((m) => m.user_id === track.teacher_id)
            ?.profiles?.name?.split(" ")[0];

          return (
            <div
              key={track.id}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full bg-${color}-400`} />
                <p className={`text-xs font-semibold text-${color}-700`}>
                  {track.skills?.title} · {teacherName} teaching
                </p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mb-2">
                <div
                  className={`h-1.5 bg-${color}-400 rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {pct}% · {done} of {total} milestones
              </p>
            </div>
          );
        })}
      </div> */}

      <div className="w-full grid grid-cols-2 gap-6 mt-15">
        <div className="col-span-2 md:col-span-1 md:py-8 md:px-2 px-2 py-6 bg-surface/50 rounded-lg">
          <div className="px-4 w-full flex items-center justify-between mb-4">
            <p className="md:text-sm text-xs font-bold text-text-primary uppercase tracking-wider">
              Resources
            </p>

            <Link
              href={`/workspaces/${id}/resources`}
              className="text-sm text-accent underline"
            >
              View all
            </Link>
          </div>

          <Resources />
        </div>
        <div className="col-span-2 md:col-span-1 p-6 rounded-lg bg-surface/50">
          <p className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
            Recent activities
          </p>

          <div className="w-full flex flex-col gap-3">
            <ActivityFeed activity={activity} loading={activityLoading} />
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Upcoming sessions
          </h2>

          {upcomingSessions.length > 1 && (
            <button
              onClick={() => router.push(`/workspaces/${id}/sessions`)}
              className="text-xs text-accent hover:underline"
            >
              View all
            </button>
          )}
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full mt-10">
            <CalendarAddOn className="text-text-secondary mb-4 select-none text-[4rem]" />

            <h3 className="text-xl font-bold text-text-primary mb-1">
              You have no sessions yet
            </h3>

            <p className="text-text-secondary mb-6 text-sm max-w-sm">
              Create your first session to get started with your scheduled
              workspace activities.
            </p>

            <Link
              href={`/workspaces/${workspace?.id}/sessions`}
              className="underline text-accent hover:opacity-80 transition-opacity"
            >
              Go to sessions page
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y gap-6 divide-gray-50">
            {upcomingSessions.map((s) => {
              const date = new Date(s.scheduled_at);
              return (
                <UpcomingSessionsCard
                  showRescheduleBtn={false}
                  workspaceId={id}
                  s={s}
                  date={date}
                  getTrackName={getTrackName}
                  key={s.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Goal */}
      {/* {workspace?.proposal?.goal && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            Goal
          </p>
          <p className="text-sm text-gray-700">{workspace.proposal.goal}</p>
        </div>
      )} */}
    </div>
  );
}
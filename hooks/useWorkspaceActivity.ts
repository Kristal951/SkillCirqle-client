import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getSocket } from "@/lib/socket";

export type ActivityType =
  | "session_scheduled"
  | "session_rescheduled"
  | "session_completed"
  | "session_cancelled"
  | "milestone_added"
  | "milestone_completed"
  | "resource_added"
  | "resource_removed";

export interface Activity {
  id: string;
  type: ActivityType;
  metadata: Record<string, any>;
  created_at: string;
  actor_id: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

function first<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

export function useWorkspaceActivity(
  workspaceId: string | undefined,
  limit = 5,
) {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    fetch();
  }, [workspaceId]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !workspaceId) return;

    const handleActivity = (activity: Activity) => {
      
      setActivity((prev) => {
        if (prev.some((a) => a.id === activity.id)) {
          return prev;
        }

        return [activity, ...prev].slice(0, limit);
      });
    };

    socket.on("workspace:activity-created", handleActivity);

    return () => {
      socket.off("workspace:activity-created", handleActivity);
    };
  }, [workspaceId, limit]);

  async function fetch() {
    const supabase = getSupabaseBrowserClient();
    setLoading(true);

    const { data, error } = await supabase
      .from("workspace_activity")
      .select(
        `
      id,
      type,
      metadata,
      created_at,
      actor_id,
      profiles!workspace_activity_actor_id_fkey (
        name,
        avatar_url
      )
  `,
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const activities: Activity[] = (data ?? []).map((row) => {
      const profile = first(row.profiles);
      return {
        id: row.id,
        type: row.type as ActivityType,
        metadata: row.metadata,
        created_at: row.created_at,
        actor_id: row.actor_id,
        profiles: {
          name: profile?.name ?? "Unknown",
          avatar_url: profile?.avatar_url ?? null,
        },
      };
    });
    setActivity(activities);
    setLoading(false);
  }

  return { activity, loading, refetch: fetch };
}

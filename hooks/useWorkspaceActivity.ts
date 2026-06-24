// hooks/useWorkspaceActivity.ts
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

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

  async function fetch() {
    const supabase = getSupabaseBrowserClient();
    setLoading(true);

    const { data, error } = await supabase.from("workspace_activity").select(`
      id,
      type,
      metadata,
      created_at,
      actor_id,
      profiles!workspace_activity_actor_id_fkey (
        name,
        avatar_url
      )
  `).limit(limit)

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

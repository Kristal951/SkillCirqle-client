"use client";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface WorkspaceSession {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  skill_track_id: string | null;
}

interface WorkspaceSessionProps {
  workspaceId: string;
  status?: string;
}

export function useWorkspaceSessions({
  workspaceId,
  status,
}: WorkspaceSessionProps) {
  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    let isMounted = true;

    async function fetchSessions() {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseBrowserClient();

      let query = supabase
        .from("skill_sessions")
        .select("id, title, scheduled_at, status, skill_track_id")
        .eq("workspace_id", workspaceId)
        .order("scheduled_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error: fetchError } = await query;

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message);
        setSessions([]);
      } else {
        setSessions(data ?? []);
      }

      setLoading(false);
    }

    fetchSessions();

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  return { sessions, loading, error };
}

"use client";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface SessionResource {
  id: string;
  type: "file" | "link" | "note";
  file_name: string | null;
  file_title: string | null;
  link_title: string | null;
  note_title: string | null;
  url: string | null;
}

export function useSessionResources(sessionId: string) {
  const [resources, setResources] = useState<SessionResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;

    async function fetchResources() {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("workspace_resources")
        .select("id, type, file_name, file_title, link_title, note_title, url")
        .eq("session_id", sessionId);

      if (!isMounted) return;

      if (error) {
        console.error("useSessionResources fetch error:", error.message);
        setResources([]);
      } else {
        setResources(data ?? []);
      }

      setLoading(false);
    }

    fetchResources();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return { resources, loading };
}

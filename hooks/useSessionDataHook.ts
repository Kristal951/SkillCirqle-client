"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";

interface Participant {
  id: string;
  name: string;
  avatar_url: string | null;
  isHost: boolean;
  isCurrentUser: boolean;
}

interface SessionData {
  title: string;
  type: "VIDEO" | "AUDIO";
  host: Participant | null;
  guest: Participant | null;
  isHost: boolean;
}

export function useSessionData(
  sessionId: string | null,
  userId: string | undefined,
) {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !userId) return;
    let isCurrent = true;

    async function fetchSession() {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("skill_sessions")
        .select(
          `
          title, host_id, guest_id, type,
          host:profiles!skill_sessions_host_id_fkey ( id, name, avatar_url ),
          guest:profiles!skill_sessions_guest_id_fkey ( id, name, avatar_url )
        `,
        )
        .eq("id", sessionId)
        .single();

      if (!isCurrent) return;

      if (error || !data) {
        console.error(error);
        toast.error(
          "Session not found",
          "This session may have been removed or the link is invalid.",
        );
        router.replace("/dashboard");
        return;
      }

      const isParticipant = data.host_id === userId || data.guest_id === userId;
      if (!isParticipant) {
        toast.error(
          "Access denied",
          "You're not a participant in this session.",
        );
        router.replace("/dashboard");
        return;
      }

      const hostRaw = Array.isArray(data.host) ? data.host[0] : data.host;
      const guestRaw = Array.isArray(data.guest) ? data.guest[0] : data.guest;

      const host: Participant | null = hostRaw
        ? {
            id: data.host_id,
            name: hostRaw.name,
            avatar_url: hostRaw.avatar_url,
            isHost: true,
            isCurrentUser: data.host_id === userId,
          }
        : null;

      const guest: Participant | null = guestRaw
        ? {
            id: data.guest_id!,
            name: guestRaw.name,
            avatar_url: guestRaw.avatar_url,
            isHost: false,
            isCurrentUser: data.guest_id === userId,
          }
        : null;

      setSessionData({
        title: data.title,
        type: data.type,
        host,
        guest,
        isHost: data.host_id === userId,
      });
      setLoading(false);
    }

    fetchSession();
    return () => {
      isCurrent = false;
    };
  }, [sessionId, userId]);

  async function markSessionActive() {
    if (!sessionId) return;
    const supabase = getSupabaseBrowserClient();
    await supabase
      .from("skill_sessions")
      .update({ status: "ACTIVE", started_at: new Date().toISOString() })
      .eq("id", sessionId);
  }

  return { sessionData, loading, markSessionActive };
}

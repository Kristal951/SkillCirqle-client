"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { getSocket } from "@/lib/socket";

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
  status: string;
  duration: number | null;
  ends_at: Date;
  workspaceId: string;
  scheduledAt: string;
}

type SocketResponse = {
  success: boolean;
  message?:
    | string
    | {
        title: string;
        desc: string;
      };
};

const showSocketError = (message?: SocketResponse["message"]) => {
  if (!message) {
    toast.error("Something went wrong");
    return;
  }

  if (typeof message === "string") {
    toast.error(message);
    return;
  }

  toast.error(message.title, message.desc);
};

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
          title, host_id, guest_id, duration, type, ends_at, workspace_id, status, scheduled_at,
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
        duration: data.duration,
        isHost: data.host_id === userId,
        status: data.status,
        ends_at: data.ends_at || null,
        workspaceId: data.workspace_id,
        scheduledAt: data.scheduled_at,
      });
      setLoading(false);
    }

    fetchSession();
    return () => {
      isCurrent = false;
    };
  }, [sessionId, userId]);

  const markSessionActive = () => {
    return new Promise<boolean>((resolve) => {
      if (!sessionId) {
        resolve(false);
        return;
      }

      const socket = getSocket();

      if (!socket?.connected) {
        console.warn("Socket is not connected. Cannot mark session as active.");
        resolve(false);
        return;
      }

      const emitStart = () => {
        socket.emit(
          "session:start",
          { sessionId },
          (response: {
            success: boolean;
            message?: string;
            requiresRating?: boolean;
            unratedSessionId?: string;
            unratedSessionType?: "VIDEO" | "AUDIO";
          }) => {
            if (!response.success) {
              if (response.requiresRating && response.unratedSessionId) {
                const path =
                  response.unratedSessionType === "AUDIO" ? "audio" : "video";

                showSocketError(response.message);
                window.location.href = `/sessions/${path}/${response.unratedSessionId}/ended?reason=completed`;
                resolve(false);
                return;
              }
              showSocketError(response?.message);
              resolve(false);
              return;
            }

            resolve(true);
          },
        );
      };

      if (socket.connected) {
        emitStart();
      } else {
        socket.once("connect", emitStart);
        setTimeout(() => {
          socket.off("connect", emitStart);
          resolve(false);
        }, 10000);
      }
    });
  };

  return { sessionData, loading, markSessionActive };
}

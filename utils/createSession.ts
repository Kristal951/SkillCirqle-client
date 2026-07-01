import { logActivity } from "@/lib/activity";
import { getSocket } from "@/lib/socket";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types/AuthStore";

interface SkillTrack {
  id: string;
  teacher_id: string;
  learner_id: string;
  skills: { title: string };
}

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

interface SessionNotificationPayload {
  receiverId: string;
  senderName: string;
  senderImage?: string;
  link?: string;
  trackName: string | undefined;
  rescheduled?: boolean;
}

interface CreateSessionProps {
  isValid: String;
  skillTracks: SkillTrack[];
  selectedTrackId: string;
  rescheduleSession?: Session | null;
  onCreated: (session: any) => void;
  workspaceId: string;
  scheduledAt: string;
  title: string;
  duration: string;
  note: string;
  sessionType: string;
  proposalId: string;
  onClose: () => void;
  user: User | null;
}

export async function createSession({
  isValid,
  skillTracks,
  selectedTrackId,
  rescheduleSession,
  onCreated,
  onClose,
  workspaceId,
  scheduledAt,
  title,
  duration,
  note,
  sessionType,
  proposalId,
  user,
}: CreateSessionProps) {
  if (!isValid || !user?.id) return;
  const supabase = getSupabaseBrowserClient();
  const track = skillTracks.find((t) => t.id === selectedTrackId);
  const isTeacher = track?.teacher_id === user?.id;
  const existing = rescheduleSession;
  const userId = user?.id
  const trackName = track?.skills?.title;

  try {
    if (existing) {
      if (isTeacher && (existing.teacher_reschedule_count ?? 0) >= 3) {
        toast.error(
          "Reschedule limit reached",
          "You can only reschedule a session up to three times.",
        );
        return;
      }

      if (!isTeacher && (existing.learner_reschedule_count ?? 0) >= 3) {
        toast.error(
          "Reschedule limit reached",
          "You can only reschedule a session up to three times.",
        );
        return;
      }
      const { data, error } = await supabase
        .from("skill_sessions")
        .update({
          last_rescheduled_at: new Date().toISOString(),
          scheduled_at: scheduledAt,
          last_rescheduled_by_id: userId,
          reschedule_count: (existing.reschedule_count ?? 0) + 1,
          teacher_reschedule_count: isTeacher
            ? (existing.teacher_reschedule_count ?? 0) + 1
            : existing.teacher_reschedule_count,
          learner_reschedule_count: !isTeacher
            ? (existing.learner_reschedule_count ?? 0) + 1
            : existing.learner_reschedule_count,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      onCreated(data);

      if (userId) {
        await logActivity(workspaceId, userId, "session_rescheduled", {
          session_title: existing.title,
          scheduled_at: scheduledAt,
        });
      }

      await sendSessionNotification(data.id, {
        receiverId:
          track?.teacher_id === userId
            ? track?.learner_id || ""
            : track?.teacher_id || "",
        senderName: user?.name ?? "Someone",
        trackName: trackName,
        senderImage: user?.avatar_url || undefined,
        link: `/workspace/${workspaceId}/sessions`,
        rescheduled: true,
      });

      toast.success("Session Rescheduled", "We'll let your partner know.");
    } else {
      const { data, error } = await supabase
        .from("skill_sessions")
        .insert({
          title: title.trim(),
          scheduled_at: scheduledAt,
          duration: duration ? parseInt(duration) : null,
          note: note.trim() || null,
          type: sessionType,
          proposal_id: proposalId,
          skill_track_id: selectedTrackId || null,
          host_id: track?.teacher_id ?? userId,
          guest_id: track?.learner_id ?? null,
          workspace_id: workspaceId,
          scheduled_by: userId,
          status: "SCHEDULED",
        })
        .select()
        .single();

      if (error) throw error;
      onCreated(data);

      if (userId) {
        await logActivity(workspaceId, userId, "session_scheduled", {
          session_title: title.trim(),
          scheduled_at: scheduledAt,
          skill:
            skillTracks.find((t) => t.id === selectedTrackId)?.skills?.title ??
            null,
        });
      }

      await sendSessionNotification(data.id, {
        receiverId:
          track?.teacher_id === userId
            ? track?.learner_id || ""
            : track?.teacher_id || "",

        senderName: user?.name ?? "Someone",
        trackName: trackName,

        senderImage: user?.avatar_url || undefined,

        link: `/workspace/${workspaceId}/sessions`,
      });

      toast.success("Session Scheduled", "We'll let your partner know.");
    }
    onClose();
  } catch (err) {
    console.error("Failed to save session:", err);
    toast.error("Something went wrong", "Please try again.");
  }
}

function sendSessionNotification(
  sessionId: string,
  payload: SessionNotificationPayload,
) {
  const socket = getSocket();
  if (!socket) return;

  const isRescheduled = payload.rescheduled;
  const skillPart = payload.trackName ? ` for ${payload.trackName}` : "";
  console.log(payload, 'pay')

  socket.emit("notification:send", {
    userId: payload.receiverId,
    type: isRescheduled ? "session_rescheduled" : "session_scheduled",
    title: isRescheduled ? "Session Rescheduled" : "New Session Scheduled",
    body: isRescheduled
      ? `${payload.senderName} rescheduled your session${skillPart}.`
      : `${payload.senderName} scheduled a session${skillPart} with you.`,
    data: {
      sessionId,
      senderImage: payload.senderImage,
      senderName: payload.senderName,
      trackName: payload.trackName,
      link: payload.link,
    },
  });
}

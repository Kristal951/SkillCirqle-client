import { useState } from "react";
import DateTimePicker, { toUTCIso, USER_TZ } from "./DateTimePicker";
import { useAuthStore } from "@/store/useAuthStore";
import Spinner from "@/components/ui/Spinner";
import { createSession } from "@/utils/createSession";
import Videocam from "@material-symbols/svg-400/outlined/video_camera_back.svg"
import Mic from "@material-symbols/svg-400/outlined/mic.svg"
import Event from "@material-symbols/svg-400/outlined/event.svg"

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

interface NewSessionModalProps {
  workspaceId: string;
  skillTracks: SkillTrack[];
  defaultDuration?: number | null;
  onClose: () => void;
  onCreated: (session: any) => void;
  rescheduleSession?: Session | null;
  proposalId: string;
  existingSessions: Session[];
}

export default function NewSessionModal({
  workspaceId,
  skillTracks,
  defaultDuration,
  onClose,
  onCreated,
  rescheduleSession,
  proposalId,
  existingSessions,
}: NewSessionModalProps) {
  const { user } = useAuthStore();
  const todayStr = new Date().toISOString().slice(0, 10);
  const existing = rescheduleSession;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [selectedDate, setSelectedDate] = useState(
    existing
      ? new Date(existing.scheduled_at).toISOString().slice(0, 10)
      : todayStr,
  );
  const [selectedTime, setSelectedTime] = useState(
    existing
      ? new Date(existing.scheduled_at).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "09:00",
  );
  const [duration, setDuration] = useState(
    existing?.duration?.toString() ?? defaultDuration?.toString() ?? "60",
  );
  const [selectedTrackId, setSelectedTrackId] = useState(
    existing?.skill_track_id ?? skillTracks[0]?.id ?? "",
  );
  const [note, setNote] = useState(existing?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [sessionType, setSessionType] = useState<"AUDIO" | "VIDEO">(
    existing?.type ?? "VIDEO",
  );
  const bookedDates = existingSessions
    .filter((s) => s.status === "SCHEDULED" && s.id !== existing?.id)
    .map((s) =>
      new Date(s.scheduled_at).toLocaleDateString("en-CA", {
        timeZone: USER_TZ,
      }),
    );

  const scheduledAt = selectedDate ? toUTCIso(selectedDate, selectedTime) : "";
  const isValid = title.trim() && selectedDate && selectedTime;

  const handleCreateSession = async () => {
    setSaving(true);

    try {
      await createSession({
        isValid,
        skillTracks,
        selectedTrackId,
        rescheduleSession,
        workspaceId,
        scheduledAt,
        title,
        duration,
        note,
        sessionType,
        proposalId,
        onCreated,
        onClose,
        user
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-3xl rounded-2xl bg-surface/50 backdrop-blur-md border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-text-primary/5 px-6 py-4">
          <h2 className="text-xl font-bold text-text-primary">
            {existing ? "Reschedule Session" : "Schedule a session"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary hover:bg-text-primary/5 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex w-full divide-x divide-text-primary/5">
          <div className="p-0 w-[45%] bg-background/50">
            <DateTimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              bookedDates={bookedDates}
            />
          </div>

          <div className="flex w-[55%] flex-col gap-6 p-6">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Session title
              </label>
              <input
                type="text"
                value={title}
                disabled={!!existing}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intro to Figma components"
                className="w-full rounded-xl bg-surface/80 px-3.5 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Duration (min)
                </label>
                <input
                  type="text"
                  value={duration}
                  disabled
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="w-full rounded-xl bg-surface/80 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Session type
                </label>
                <div className="flex gap-2 h-10.5">
                  {(["VIDEO", "AUDIO"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSessionType(t)}
                      className={`flex flex-1 items-center justify-center ${existing ? "opacity-80 pointer-events-none" : ""} gap-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        sessionType === t
                          ? "bg-primary border-primary/30 text-text-primary"
                          : "border-text-primary/10 bg-surface/20 text-text-secondary hover:bg-text-primary/5"
                      }`}
                    >
                      {/* <span className="material-symbols-outlined text-[15px]">
                        {t === "VIDEO" ? "videocam" : "mic"}
                      </span> */}
                      {
                        t === "VIDEO" ? (
                          <Videocam className="text-[15px]"/>
                        ) : (
                          <Mic className="text-[15px]"/>
                        )
                      }
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {skillTracks.length > 1 && (
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Skill track
                </label>
                <div className="flex gap-2">
                  {skillTracks.map((track, i) => {
                    const isActive = selectedTrackId === track.id;
                    const activeStyles =
                      i === 0
                        ? "bg-primary/30 border-primary/30 text-text-primary"
                        : "bg-accent/30 border-accent/30 text-accent";
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setSelectedTrackId(track.id)}
                        disabled={!!existing}
                        className={`flex-1 disabled:pointer-events-none rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                          isActive
                            ? activeStyles
                            : "border-text-primary/10 bg-surface/20 text-text-secondary hover:bg-text-primary/5"
                        }`}
                      >
                        {track.skills?.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex-1">
              <label className="mb-1.5 block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Notes{" "}
                <span className="font-normal lowercase text-text-secondary/40">
                  (optional)
                </span>
              </label>
              <textarea
                value={note}
                disabled={!!existing}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What will you cover in this session?"
                rows={5}
                className="w-full disabled:pointer-events-none resize-none rounded-xl bg-surface/80 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-text-primary/5 px-6 py-4 bg-text-primary/2 rounded-b-2xl">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Session scheduled for
            </p>
            <div className="flex items-center gap-1">
              <Event className="text-text-primary text-sm"/>
              <p className="text-xs text-text-primary">
                {selectedDate && selectedTime
                  ? new Date(
                      toUTCIso(selectedDate, selectedTime),
                    ).toLocaleString("en-GB", {
                      timeZone: USER_TZ,
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "No date selected"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-text-primary/10 bg-surface/20 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-text-primary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSession}
              disabled={!isValid || saving}
              className="rounded-lg bg-primary/90 px-4 py-3 text-sm font-medium text-text-primary transition-all hover:bg-primary active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size={20} />
                  <span>Saving Session...</span>
                </span>
              ) : existing ? (
                "Reschedule Session"
              ) : (
                "Schedule Session"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

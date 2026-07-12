"use client";
import { logActivity } from "@/lib/activity";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeProfile } from "@/utils/normalizeProfile";
import { useWorkspaceSessions } from "@/hooks/useWorkspaceSessions";
import { useRef, useState } from "react";
import ImageIcon from "@material-symbols/svg-400/outlined/image.svg";
import Video from "@material-symbols/svg-400/outlined/video_camera_back.svg";
import Pdf from "@material-symbols/svg-400/outlined/picture_as_pdf.svg";
import TableChart from "@material-symbols/svg-400/outlined/table_chart.svg";
import SlideShow from "@material-symbols/svg-400/outlined/slideshow.svg";
import FolderZip from "@material-symbols/svg-400/outlined/folder_zip.svg";
import Description from "@material-symbols/svg-400/outlined/description.svg";
import Link from "@material-symbols/svg-400/outlined/link.svg";
import UploadFile from "@material-symbols/svg-400/outlined/upload_file.svg";
import CloudUpload from "@material-symbols/svg-400/outlined/cloud_upload.svg";
import CalendarToday from "@material-symbols/svg-400/outlined/calendar_today.svg";
import StickyNote2 from "@material-symbols/svg-400/outlined/sticky_note_2.svg";
import Close from "@material-symbols/svg-400/outlined/close.svg";
import { Delete, Edit } from "lucide-react";
import NoteResourceFullScreenEditor from "./NoteResourceEditor";
import { getSocket } from "@/lib/socket";

type ResourceType = "file" | "link" | "note";

interface Resource {
  id: string;
  type: ResourceType;
  skill_track_id: string | null;
  session_id: string | null;
  file_name: string | null;
  file_title: string | null;
  file_size: number | null;
  file_mime_type: string | null;
  storage_path: string | null;
  url: string | null;
  link_title: string | null;
  note_title: string | null;
  note_body: string | null;
  description: string | null;
  created_at: string;
  uploaded_by: string;
  profiles: { name: string; avatar_url: string | null };
}

const ACCEPTED_TYPES = "application/pdf,image/*,video/*,.docx,.xlsx,.pptx,.zip";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mime: string | null) {
  if (!mime) return Description;
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.startsWith("video/")) return Video;
  if (mime.includes("pdf")) return Pdf;
  if (mime.includes("sheet") || mime.includes("excel")) return TableChart;
  if (mime.includes("presentation") || mime.includes("powerpoint"))
    return SlideShow;
  if (mime.includes("zip")) return FolderZip;
  return Description;
}

function formatSessionLabel(session: { title: string; scheduled_at: string }) {
  const date = new Date(session.scheduled_at);
  const dateStr = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${session.title} · ${dateStr}`;
}

function extractText(node: any): string {
  if (!node) return "";
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractText).join(" ");
  }
  return "";
}

function stripToPreview(jsonString: string): string {
  try {
    const json = JSON.parse(jsonString);
    const text = extractText(json);
    return text.slice(0, 140);
  } catch {
    return "";
  }
}

export function AddResourceModal({
  workspaceId,
  skillTracks,
  onClose,
  onAdded,
}: {
  workspaceId: string;
  skillTracks: any[];
  onClose: () => void;
  onAdded: (resource: Resource) => void;
}) {
  const { user } = useAuthStore();
  const status = "SCHEDULED";
  const { sessions, loading: sessionsLoading } = useWorkspaceSessions({
    workspaceId,
    status,
  });
  const [showNoteComposer, setShowNoteComposer] = useState(false);

  const [tabType, setTabType] = useState<ResourceType>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    skillTracks[0]?.id ?? "",
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isValid =
    (tabType === "file" && !!selectedFile) ||
    (tabType === "link" && linkUrl.trim()) ||
    (tabType === "note" && noteTitle.trim());

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    const supabase = getSupabaseBrowserClient();
    const socket = getSocket();

    try {
      let storagePath: string | null = null;
      if (tabType === "file" && selectedFile) {
        const ext = selectedFile.name.split(".").pop();
        const path = `${workspaceId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("workspace-resources")
          .upload(path, selectedFile);
        if (uploadError) throw uploadError;
        storagePath = path;
      }

      const { data, error } = await supabase
        .from("workspace_resources")
        .insert({
          workspace_id: workspaceId,
          uploaded_by: user?.id,
          type: tabType,
          skill_track_id: selectedTrackId || null,
          session_id: selectedSessionId || null,
          description: description.trim() || null,
          file_name: selectedFile?.name ?? null,
          file_title: fileTitle.trim() || null,
          file_size: selectedFile?.size ?? null,
          file_mime_type: selectedFile?.type ?? null,
          storage_path: storagePath,
          url: linkUrl.trim() || null,
          link_title: linkTitle.trim() || null,
          note_title: noteTitle.trim() || null,
          note_body: noteBody || null,
        })
        .select(
          `
        id, type, skill_track_id, session_id, file_name, file_title, file_size, file_mime_type,
        storage_path, url, link_title, note_title, note_body,
        description, created_at, uploaded_by,
        profiles ( name, avatar_url )
      `,
        )
        .single();

      if (error) throw error;
      const normalized = normalizeProfile(data);
      onAdded(normalized as Resource);

      const resourceName =
        tabType === "file"
          ? fileTitle.trim() || selectedFile?.name
          : tabType === "link"
            ? linkTitle.trim() || linkUrl.trim()
            : noteTitle.trim();

      const trackName =
        skillTracks.find((t) => t.id === selectedTrackId)?.skills?.title ??
        null;

      if (user?.id) {
        await logActivity(workspaceId, user.id, "resource_added", {
          resource_name: resourceName,
          resource_type: tabType,
          skill: trackName,
        });
      }

      socket?.emit("workspace:resource-added", {
        workspaceId,
        resourceId: data.id,
      });

      toast.success("Resource added", "It's now visible to both of you.");
      onClose();
    } catch (err) {
      console.error("Failed to add resource:", err);
      toast.error("Something went wrong", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const FileIcon = fileIcon(selectedFile?.type || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-2xl bg-surface backdrop-blur-md border border-border shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-text-primary/5 px-6 py-4">
          <h2 className="text-lg font-bold text-text-primary">Add resource</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary hover:bg-text-primary/5 transition-colors"
          >
            <Close className="text-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex gap-2">
            {[
              { type: "file" as const, Icon: UploadFile },
              { type: "link" as const, Icon: Link },
              { type: "note" as const, Icon: StickyNote2 },
            ].map(({ type, Icon }) => (
              <button
                key={type}
                onClick={() => setTabType(type)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold capitalize py-2.5 rounded-xl border transition-all ${
                  tabType === type
                    ? "bg-primary/10 border-primary/30 text-text-primary"
                    : "border-text-primary/10 text-text-secondary hover:bg-text-primary/5"
                }`}
              >
                <Icon className="text-[15px]" />
                {type}
              </button>
            ))}
          </div>

          {tabType === "file" && (
            <>
              {!selectedFile ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) setSelectedFile(f);
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-text-primary/10 hover:border-primary/30 hover:bg-text-primary/2"
                  }`}
                >
                  <div className="w-full flex items-center justify-center">
                    <CloudUpload className="text-text-secondary/30 text-[32px] mb-2" />
                  </div>
                  <p className="text-sm text-text-secondary">
                    Drop a file or click to browse
                  </p>
                  <p className="text-xs text-text-secondary/40 mt-1">
                    PDF, images, video, docs · max 50 MB
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && setSelectedFile(e.target.files[0])
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border border-text-primary/10 rounded-xl p-3">
                    <FileIcon className="text-[20px] text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-text-secondary/50">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="md:text-text-secondary/40 hover:text-text-primary text-text-primary"
                    >
                      <Close className="text-[16px]" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">
                      Display title{" "}
                      <span className="text-text-secondary/40">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      placeholder={selectedFile.name}
                      className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {tabType === "link" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">
                  Display title
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="e.g. Refactoring UI — colour chapter"
                  className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          )}

          {tabType === "note" && (
            <div className="flex flex-col gap-3">
              {!noteTitle && !noteBody ? (
                <button
                  onClick={() => setShowNoteComposer(true)}
                  className="w-full border-2 border-dashed border-text-primary/10 rounded-xl p-6 text-center hover:border-primary/30 hover:bg-text-primary/2 transition-colors"
                >
                  <div className="w-full flex items-center justify-center">
                    <StickyNote2 className="text-text-secondary/30 text-[32px] mb-2" />
                  </div>
                  <p className="text-sm text-text-secondary">
                    Click to write a note
                  </p>
                </button>
              ) : (
                <div className="flex items-start gap-3 border border-text-primary/10 rounded-xl p-3.5">
                  <StickyNote2 className="text-primary text-[18px] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {noteTitle || "Untitled note"}
                    </p>
                    {noteBody && (
                      <p className="text-xs text-text-secondary/70 mt-0.5 line-clamp-2">
                        {stripToPreview(noteBody)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setShowNoteComposer(true)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-text-primary/5 hover:text-text-primary transition-colors"
                      aria-label="Edit note"
                    >
                      <Edit className="text-[16px]" />
                    </button>
                    <button
                      onClick={() => {
                        setNoteTitle("");
                        setNoteBody("");
                      }}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      aria-label="Remove note"
                    >
                      <Delete className="text-[16px]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {skillTracks.length > 0 && (
            <div>
              <label className="text-xs text-text-secondary mb-2 block">
                Skill track
              </label>
              <div className="flex gap-2 flex-wrap">
                {skillTracks.map((track, i) => {
                  const isSelected = selectedTrackId === track.id;
                  const activeStyles =
                    i === 0
                      ? "bg-primary/20 border-border text-text-primary"
                      : "bg-accent/20 border-accent/30 text-text-primary";
                  return (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrackId(track.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                        isSelected
                          ? activeStyles
                          : "border-text-primary/10 text-text-secondary hover:bg-text-primary/5"
                      }`}
                    >
                      {track.skills?.title}
                    </button>
                  );
                })}
                <button
                  onClick={() => setSelectedTrackId("")}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    !selectedTrackId
                      ? "bg-text-primary/10 border-text-primary/20 text-text-primary"
                      : "border-text-primary/10 text-text-secondary hover:bg-text-primary/5"
                  }`}
                >
                  Shared
                </button>
              </div>
            </div>
          )}

          {sessionsLoading ? (
            <div>
              <label className="text-xs text-text-secondary mb-2 flex items-center gap-1.5">
                <CalendarToday className="text-[13px]" />
                Attach to a session
                <span className="text-text-secondary/40">(optional)</span>
              </label>
              <div className="h-10 w-full rounded-xl bg-text-primary/5 animate-pulse" />
            </div>
          ) : (
            sessions.length > 0 && (
              <div>
                <label className="text-xs text-text-secondary mb-2 flex items-center gap-1.5">
                  <CalendarToday className="text-[13px]" />
                  Attach to a session
                  <span className="text-text-secondary/40">(optional)</span>
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="">Not tied to a specific session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {formatSessionLabel(session)}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}

          <div>
            <label className="text-xs text-text-secondary mb-1 block">
              Description{" "}
              <span className="text-text-secondary/40">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this resource for?"
              rows={2}
              className="w-full resize-none rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-text-primary/5 bg-text-primary/2 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-text-primary/10 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-text-primary/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {saving ? "Adding…" : "Add resource"}
          </button>
        </div>
      </div>

      {showNoteComposer && (
        <NoteResourceFullScreenEditor
          initialTitle={noteTitle}
          initialContent={noteBody}
          onSave={(title, content) => {
            setNoteTitle(title);
            setNoteBody(content);
            setShowNoteComposer(false);
          }}
          onCancel={() => setShowNoteComposer(false)}
        />
      )}
    </div>
  );
}

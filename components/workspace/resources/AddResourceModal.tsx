"use client";
import { logActivity } from "@/lib/activity";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeProfile } from "@/utils/normalizeProfile";
import { useRef, useState } from "react";
import MarkdownToolbar from "./MarkDownToolBar";
import { renderSimpleMarkdown } from "@/lib/simpleMarkDown";
import ImageIcon from "@material-symbols/svg-400/outlined/image.svg"
import Video from "@material-symbols/svg-400/outlined/video_camera_back.svg"
import Pdf from "@material-symbols/svg-400/outlined/picture_as_pdf.svg"
import TableChart from "@material-symbols/svg-400/outlined/table_chart.svg"
import SlideShow from "@material-symbols/svg-400/outlined/slideshow.svg"
import FolderZip from "@material-symbols/svg-400/outlined/folder_zip.svg"
import Description from "@material-symbols/svg-400/outlined/description.svg"
import Close from "@material-symbols/svg-400/outlined/close.svg"
import Link from "@material-symbols/svg-400/outlined/link.svg"
import UploadFile from "@material-symbols/svg-400/outlined/upload_file.svg"
import CloudUpload from "@material-symbols/svg-400/outlined/cloud_upload.svg"

type ResourceType = "file" | "link" | "note";

interface Resource {
  id: string;
  type: ResourceType;
  skill_track_id: string | null;
  file_name: string | null;
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
  const [tabType, setTabType] = useState<ResourceType>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    skillTracks[0]?.id ?? "",
  );
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const isValid =
    (tabType === "file" && !!selectedFile) ||
    (tabType === "link" && linkUrl.trim()) ||
    (tabType === "note" && noteTitle.trim());

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    const supabase = getSupabaseBrowserClient();
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
          description: description.trim() || null,
          file_name: selectedFile?.name ?? null,
          file_size: selectedFile?.size ?? null,
          file_mime_type: selectedFile?.type ?? null,
          storage_path: storagePath,
          url: linkUrl.trim() || null,
          link_title: linkTitle.trim() || null,
          note_title: noteTitle.trim() || null,
          note_body: noteBody.trim() || null,
        })
        .select(
          `
        id, type, skill_track_id, file_name, file_size, file_mime_type,
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
          ? selectedFile?.name
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

      toast.success("Resource added", "It's now visible to both of you.");
      onClose();
    } catch (err) {
      console.error("Failed to add resource:", err);
      toast.error("Something went wrong", "Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-2xl bg-surface backdrop-blur-md border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-text-primary/5 px-6 py-4">
          <h2 className="text-lg font-bold text-text-primary">Add resource</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary hover:bg-text-primary/5 transition-colors"
          >
            <Close className="text-[18px]"/>
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex gap-2">
            {[
              { type: "file" as const, Icon: UploadFile },
              { type: "link" as const, Icon: Link },
              //   { type: "note" as const, icon: "sticky_note_2" },
            ].map(({ type, Icon }) => (
              <button
                key={type}
                onClick={() => setTabType(type)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold capitalize py-2.5 rounded-xl border transition-all ${
                  tabType === type
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-text-primary/10 text-text-secondary hover:bg-text-primary/5"
                }`}
              >
                <Icon className="text-[15px]"/>
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
   <CloudUpload className="text-text-secondary/30 text-[32px] mb-2"/>
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
                <div className="flex items-center gap-3 border border-text-primary/10 rounded-xl p-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {fileIcon(selectedFile.type)}
                  </span>
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
                    className="text-text-secondary/40 hover:text-text-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      close
                    </span>
                  </button>
                </div>
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

          {/* {tabType === "note" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Session notes — Intro to Figma"
                  className="w-full rounded-xl bg-surface/80 border border-text-primary/10 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-text-secondary block">
                    Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className="text-[11px] text-primary hover:underline"
                  >
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                </div>

                {showPreview ? (
                  <div
                    className="w-full rounded-xl bg-surface/40 border border-text-primary/10 px-3.5 py-2.5 text-sm text-text-primary min-h-[112px]"
                    dangerouslySetInnerHTML={{
                      __html: renderSimpleMarkdown(
                        noteBody || "Nothing to preview yet.",
                      ),
                    }}
                  />
                ) : (
                  <>
                    <MarkdownToolbar
                      value={noteBody}
                      onChange={setNoteBody}
                      textareaRef={noteRef}
                    />
                    <textarea
                      ref={noteRef}
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Write your note here… use **bold**, _italic_, lists, and links"
                      rows={5}
                      className="w-full resize-none rounded-b-xl rounded-t-none bg-surface/80 border border-text-primary/10 border-t-0 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </>
                )}
              </div>
            </div>
          )} */}

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
    </div>
  );
}

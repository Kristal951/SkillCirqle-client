"use client";
import { ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";
import React from "react";

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

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mime: string | null) {
  if (!mime) return "description";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "movie";
  if (mime.includes("pdf")) return "picture_as_pdf";
  if (mime.includes("sheet") || mime.includes("excel")) return "table_chart";
  if (mime.includes("presentation") || mime.includes("powerpoint"))
    return "slideshow";
  if (mime.includes("zip")) return "folder_zip";
  return "description";
}

export function ResourceRow({
  resource: r,
  color,
  trackName,
  isOwner,
  onOpen,
  onDelete,
}: {
  resource: Resource;
  color: string;
  trackName: string | null;
  isOwner: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const icon =
    r.type === "link"
      ? "link"
      : r.type === "note"
        ? "sticky_note_2"
        : fileIcon(r.file_mime_type);

  const title =
    r.type === "file"
      ? r.file_name
      : r.type === "link"
        ? r.link_title || r.url
        : r.note_title;

  const showSize = r.type === "file" && r.file_size;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 group hover:bg-text-primary/2 border-b border-text-primary/3 last:border-0 transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0
          ${
            r.type === "link"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : r.type === "note"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : r.type === "file"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  :  "bg-text-primary/5 text-text-secondary border-text-primary/10"
          }`}
        >
          <span className="material-symbols-outlined text-base">{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm text-text-primary font-medium truncate"
            title={title ?? ""}
          >
            {title || "Untitled Resource"}
          </p>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary/60 flex-wrap">
            {showSize && <span>{formatBytes(r.file_size!)}</span>}

            {showSize && (
              <span className="text-text-secondary select-none">·</span>
            )}

            <div className="w-5 h-5 rounded-full relative overflow-hidden bg-text-primary/10 shrink-0 border border-text-primary/5">
              {r.profiles?.avatar_url ? (
                <Image
                  src={r.profiles.avatar_url}
                  alt={r.profiles.name || "Avatar"}
                  fill
                  sizes="20px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-text-secondary uppercase">
                  {r.profiles?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            {trackName && (
              <>
                <span className="text-text-secondary select-none">·</span>
                <span
                  className={`font-medium ${color === "primary" ? "text-primary" : "text-accent"}`}
                >
                  {trackName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shrink-0">
        {(r.type === "file" || r.type === "note") && (
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline transition-all focus:outline-none focus:ring-1 focus:ring-accent rounded px-1"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {r.type === "link" && r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-400 hover:underline transition-all flex items-center gap-0.5"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {isOwner && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete item"
            className="p-2 text-red-400/70 hover:text-red-500 hover:bg-red-500/10 active:bg-red-500/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

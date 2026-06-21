"use client";
import React from "react";
import Image from "next/image";
import { ExternalLink, Trash2 } from "lucide-react";

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

export function ResourceCard({
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

  return (
    <div className="group relative flex flex-col justify-between p-4 rounded-2xl bg-surface/50 border border-text-primary/5 hover:border-text-primary/10 hover:bg-surface/80 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 min-h-40">
      <div className="flex items-start justify-between w-full">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0
          ${
            r.type === "link"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : r.type === "note"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : r.type === "file"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-text-primary/5 text-text-secondary border-text-primary/10"
          }`}
        >
          <span className="material-symbols-outlined text-base">{icon}</span>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 md:text-text-secondary/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/40"
            aria-label="Delete resource"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="min-w-0 my-3 flex-1">
        <p
          className="text-sm font-semibold text-text-primary truncate"
          title={title ?? ""}
        >
          {title || "Untitled Resource"}
        </p>

        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary flex-wrap">
          {r.type === "file" && r.file_size && (
            <span className="opacity-60">{formatBytes(r.file_size)}</span>
          )}

          {r.type === "file" && r.file_size && trackName && (
            <span className="opacity-20">|</span>
          )}

          {trackName && (
            <span
              className={`font-medium ${color === "primary" ? "text-primary" : "text-accent"}`}
            >
              {trackName}
            </span>
          )}
        </div>
      </div>

      <div className="w-full flex items-center justify-between pt-2 border-t border-text-primary/5 mt-auto gap-4">
        <div className="flex items-center gap-2 min-w-0">
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
        </div>

        {r.type === "file" || r.type === "link" ? (
          <button
            type="button"
            onClick={
              r.type === "link" ? () => window.open(r.url!, "_blank") : onOpen
            }
            className="text-xs text-accent font-semibold hover:text-accent/80 transition-colors shrink-0 flex items-center gap-0.5"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary/40 shrink-0">
            Note
          </span>
        )}
      </div>
    </div>
  );
}

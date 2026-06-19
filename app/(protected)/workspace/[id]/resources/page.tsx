"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "next/navigation";
import { AddResourceModal } from "@/components/workspace/resources/AddResourceModal";
import { ResourceRow } from "@/components/workspace/resources/ResourceListRow";
import { ResourceCard } from "@/components/workspace/resources/ResourceGridCard";
import { GridSkeleton } from "@/components/workspace/resources/GridSkeleton";
import { ListSkeleton } from "@/components/workspace/resources/ListSkeleton";
import { EmptyState } from "@/components/workspace/resources/EmptyState";
import { logActivity } from "@/lib/activity";
import { normalizeProfile } from "@/utils/normalizeProfile";

type ResourceType = "file" | "link" | "note";
type ViewMode = "grid" | "list";

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

export default function ResourcesPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { user } = useAuthStore();
  const { skillTracks } = useWorkspace(workspaceId);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    fetchResources();
  }, [workspaceId]);

  async function fetchResources() {
    const supabase = getSupabaseBrowserClient();
    setLoading(true);
    const { data } = await supabase
      .from("workspace_resources")
      .select(
        `
        id, type, skill_track_id, file_name, file_size, file_mime_type,
        storage_path, url, link_title, note_title, note_body,
        description, created_at, uploaded_by,
        profiles ( name, avatar_url )
      `,
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

      const normalized = (data ?? []).map(normalizeProfile)
    setResources(normalized as Resource[]);
    setLoading(false);
  }

  async function handleDelete(resource: Resource) {
    const supabase = getSupabaseBrowserClient();
    if (resource.storage_path) {
      await supabase.storage
        .from("workspace-resources")
        .remove([resource.storage_path]);
    }
    await supabase.from("workspace_resources").delete().eq("id", resource.id);
    setResources((prev) => prev.filter((r) => r.id !== resource.id));

    const resourceName =
      resource.type === "file"
        ? resource.file_name
        : resource.type === "link"
          ? resource.link_title || resource.url
          : resource.note_title;

    if (user?.id) {
      await logActivity(workspaceId, user.id, "resource_removed", {
        resource_name: resourceName,
        resource_type: resource.type,
      });
    }

    toast.success(
      "Resource removed",
      "It's no longer visible in this workspace.",
    );
  }

  async function getSignedUrl(storagePath: string) {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.storage
      .from("workspace-resources")
      .createSignedUrl(storagePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  function getTrackColor(trackId: string | null) {
    if (!trackId) return "gray";
    const idx = skillTracks.findIndex((t) => t.id === trackId);
    return idx === 0 ? "emerald" : "violet";
  }

  function getTrackName(trackId: string | null) {
    return skillTracks.find((t) => t.id === trackId)?.skills?.title ?? null;
  }

  const filtered =
    activeTrack === "all"
      ? resources
      : resources.filter((r) => r.skill_track_id === activeTrack);

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Resources</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Files, links, and notes shared in this workspace
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary/10"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add resource
          </button>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTrack("all")}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                activeTrack === "all"
                  ? "bg-primary text-text-primary border-border"
                  : "bg-surface/50 text-text-secondary border-border hover:bg-text-primary/5"
              }`}
            >
              All
            </button>
            {skillTracks.map((track, i) => {
              const isActive = activeTrack === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrack(track.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-text-primary border-border"
                      : "bg-surface/50 text-text-secondary border-border hover:bg-text-primary/5"
                  }`}
                >
                  {track.skills?.title}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-surface/50 border border-text-primary/10 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-text-primary/5"
              }`}
              aria-label="Grid view"
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-text-primary/5"
              }`}
              aria-label="List view"
            >
              <span className="material-symbols-outlined text-[18px]">
                view_list
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          viewMode === "grid" ? (
            <GridSkeleton />
          ) : (
            <ListSkeleton />
          )
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                color={getTrackColor(r.skill_track_id)}
                trackName={getTrackName(r.skill_track_id)}
                isOwner={r.uploaded_by === user?.id}
                onOpen={() => r.storage_path && getSignedUrl(r.storage_path)}
                onDelete={() => handleDelete(r)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface/50 rounded-2xl border border-text-primary/5 divide-y divide-text-primary/5">
            {filtered.map((r) => (
              <ResourceRow
                key={r.id}
                resource={r}
                color={getTrackColor(r.skill_track_id)}
                trackName={getTrackName(r.skill_track_id)}
                isOwner={r.uploaded_by === user?.id}
                onOpen={() => r.storage_path && getSignedUrl(r.storage_path)}
                onDelete={() => handleDelete(r)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddResourceModal
          workspaceId={workspaceId}
          skillTracks={skillTracks}
          onClose={() => setShowModal(false)}
          onAdded={(resource) => setResources((prev) => [resource, ...prev])}
        />
      )}
    </>
  );
}

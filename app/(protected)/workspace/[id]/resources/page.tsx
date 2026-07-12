"use client";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWorkspaceResources } from "@/hooks/useWorkspaceResources";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AddResourceModal } from "@/components/workspace/resources/AddResourceModal";
import { ResourceRow } from "@/components/workspace/resources/ResourceListRow";
import { ResourceCard } from "@/components/workspace/resources/ResourceGridCard";
import { GridSkeleton } from "@/components/workspace/resources/GridSkeleton";
import { ListSkeleton } from "@/components/workspace/resources/ListSkeleton";
import { EmptyState } from "@/components/workspace/resources/EmptyState";
import { Plus } from "lucide-react";
import GridView from "@material-symbols/svg-400/outlined/grid_view.svg";
import ViewList from "@material-symbols/svg-400/outlined/view_list.svg";
import Add from "@material-symbols/svg-400/outlined/add.svg";
import NoteResourceFullScreenEditor from "@/components/workspace/resources/NoteResourceEditor";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { user } = useAuthStore();
  const { skillTracks } = useWorkspace(workspaceId);

  const {
    resources,
    loading,
    error,
    addResource,
    handleDeleteResource,
    updateResource,
    deletingResourceID,
  } = useWorkspaceResources({ workspaceId, limit: 0 });

  const [activeTrack, setActiveTrack] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showModal, setShowModal] = useState(false);
  const [openNote, setOpenNote] = useState<Resource | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const resourceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (error) {
      toast.error("Couldn't load resources", error);
    }
  }, [error]);

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (!highlight || loading || resources.length === 0) return;

    const exists = resources.some((r) => r.id === highlight);
    if (!exists) return;

    const target = resources.find((r) => r.id === highlight);

    if (
      target?.skill_track_id &&
      activeTrack !== "all" &&
      activeTrack !== target.skill_track_id
    ) {
      setActiveTrack("all");
      return;
    }

    setHighlightedId(highlight);

    const el = resourceRefs.current[highlight];

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const timeout = setTimeout(() => {
      setHighlightedId(null);
      router.replace(`/workspace/${workspaceId}/resources`, { scroll: false });
    }, 2500);

    return () => clearTimeout(timeout);
  }, [searchParams, loading, resources, activeTrack, workspaceId, router]);

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
    return idx === 0 ? "primary" : "accent";
  }

  function getTrackName(trackId: string | null) {
    return skillTracks.find((t) => t.id === trackId)?.skills?.title ?? null;
  }

  const handleOpenResource = (r: Resource) => {
    if (r.type === "note") {
      setOpenNote(r);
    } else if (r.type === "file") {
      r.storage_path && getSignedUrl(r.storage_path);
    }
  };

  const filtered =
    activeTrack === "all"
      ? resources
      : resources.filter((r) => r.skill_track_id === activeTrack);

  return (
    <>
      <div className="w-full pb-24 md:pb-6 relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Resources</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Files, links, and notes shared in this workspace
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-text-primary text-sm px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary/10"
          >
            <Add className="text-[18px]" />
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
            {skillTracks.map((track) => {
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
                  ? "bg-primary/10 text-text-primary"
                  : "text-text-secondary hover:bg-text-primary/5"
              }`}
              aria-label="Grid view"
            >
              <GridView className="text-[18px]" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-primary/10 text-text-primary"
                  : "text-text-secondary hover:bg-text-primary/5"
              }`}
              aria-label="List view"
            >
              <ViewList className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="w-full mt-10">
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
                <div
                  key={r.id}
                  ref={(el) => {
                    resourceRefs.current[r.id] = el;
                  }}
                  className={`rounded-2xl transition-all duration-500 ${
                    highlightedId === r.id ? "animate-highlight-pulse" : ""
                  }`}
                >
                  <ResourceCard
                    resource={r}
                    color={getTrackColor(r.skill_track_id)}
                    trackName={getTrackName(r.skill_track_id)}
                    isOwner={r.uploaded_by === user?.id}
                    onOpen={() => handleOpenResource(r)}
                    onDelete={() => handleDeleteResource(r)}
                    deletingResourceID={deletingResourceID}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface/50 rounded-2xl flex flex-col gap-2 border border-text-primary/5 divide-y divide-text-primary/5">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  ref={(el) => {
                    resourceRefs.current[r.id] = el;
                  }}
                  className={`transition-all duration-500 ${
                    highlightedId === r.id
                      ? "animate-highlight-pulse bg-primary/5"
                      : ""
                  }`}
                >
                  <ResourceRow
                    resource={r}
                    color={getTrackColor(r.skill_track_id)}
                    trackName={getTrackName(r.skill_track_id)}
                    isOwner={r.uploaded_by === user?.id}
                    onOpen={() => handleOpenResource(r)}
                    onDelete={() => handleDeleteResource(r)}
                    deletingResourceID={deletingResourceID}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:hidden fixed bottom-20 right-6 z-40">
          <button
            onClick={() => setShowModal(true)}
            aria-label="Add new resource"
            className="bg-primary hover:bg-primary/90 text-text-primary p-4 rounded-full shadow-xl transition-all duration-200 active:scale-95 hover:scale-105 flex items-center justify-center border border-white/10"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {showModal && (
        <AddResourceModal
          workspaceId={workspaceId}
          skillTracks={skillTracks}
          onClose={() => setShowModal(false)}
          onAdded={(resource) => addResource(resource)}
        />
      )}

      {openNote && (
        <NoteResourceFullScreenEditor
          initialTitle={openNote.note_title || ""}
          initialContent={openNote.note_body || ""}
          onSave={async (title, content) => {
            await updateResource(openNote.id, {
              note_title: title,
              note_body: content,
            });
            setOpenNote(null);
          }}
          onCancel={() => setOpenNote(null)}
        />
      )}
    </>
  );
}

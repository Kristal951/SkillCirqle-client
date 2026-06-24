"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWorkspaceResources } from "@/hooks/useWorkspaceResources";
import Spinner from "@/components/ui/Spinner";
import { ResourceRow } from "../resources/ResourceListRow";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const Resources = () => {
  const params = useParams();
  const workspaceId = params.id as string;

  const { resources, loading, error, handleDeleteResource } =
    useWorkspaceResources({
      workspaceId,
    });
  const { skillTracks } = useWorkspace(workspaceId);
  const { user } = useAuthStore();

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-text-primary/5 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-3/4 rounded-md bg-text-primary/5" />
              <div className="h-2.5 w-1/4 rounded-md bg-text-primary/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 py-6">
        Failed to load resources: {error}
      </p>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">No resources added yet.</p>
      </div>
    );
  }

  function getTrackColor(trackId: string | null) {
    if (!trackId) return "gray";
    const idx = skillTracks.findIndex((t) => t.id === trackId);
    return idx === 0 ? "primary" : "accent";
  }

  function getTrackName(trackId: string | null) {
    return skillTracks.find((t) => t.id === trackId)?.skills?.title ?? null;
  }

  async function getSignedUrl(storagePath: string) {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.storage
      .from("workspace-resources")
      .createSignedUrl(storagePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => {
        return (
          <ResourceRow
            key={resource.id}
            resource={resource}
            color={getTrackColor(resource.skill_track_id)}
            trackName={getTrackName(resource.skill_track_id)}
            isOwner={resource.uploaded_by === user?.id}
            onOpen={() =>
              resource.storage_path && getSignedUrl(resource.storage_path)
            }
            onDelete={() => handleDeleteResource(resource)}
          />
        );
      })}
    </div>
  );
};

export default Resources;

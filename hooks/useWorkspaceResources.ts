"use client";
import { logActivity } from "@/lib/activity";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

interface UseWorkspaceResourcesProps {
  workspaceId: string;
  limit?: number;
}

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

export function useWorkspaceResources({
  workspaceId,
  limit = 5,
}: UseWorkspaceResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function fetchResources() {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseBrowserClient();
      let query = supabase
        .from("workspace_resources")
        .select(
          "*, profiles!workspace_resources_uploaded_by_fkey(name, avatar_url)",
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error: fetchError } = await query;

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message);
        setResources([]);
      } else {
        setResources(data ?? []);
      }

      setLoading(false);
    }

    fetchResources();

    return () => {
      isMounted = false;
    };
  }, [workspaceId, limit]);

  async function handleDeleteResource(resource: Resource) {
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

  function addResource(resource: Resource) {
    setResources((prev) => [resource, ...prev]);
  }

  return { resources, loading, error, handleDeleteResource, addResource };
}

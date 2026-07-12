"use client";
import { logActivity } from "@/lib/activity";
import { getSocket } from "@/lib/socket";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

interface UseWorkspaceResourcesProps {
  workspaceId: string;
  limit?: number;
  sessionId?: string;
}

type ResourceType = "file" | "link" | "note";

interface Resource {
  id: string;
  type: ResourceType;
  skill_track_id: string | null;
  session_id?: string | null;
  file_title?: string | null;
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
  workspace_id?: string;
  profiles: { name: string; avatar_url: string | null };
}

export function useWorkspaceResources({
  workspaceId,
  limit,
  sessionId,
}: UseWorkspaceResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingResourceID, setDeletingResourceID] = useState<string>("");
  const { user } = useAuthStore();

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !workspaceId) return;

    const handleResource = (resource: Resource) => {
      if (resource.workspace_id !== workspaceId) return;

      setResources((prev) => {
        if (prev.some((r) => r.id === resource.id)) return prev;

        return limit
          ? [resource, ...prev].slice(0, limit)
          : [resource, ...prev];
      });
    };

    socket.on("workspace:resource-added", handleResource);

    return () => {
      socket.off("workspace:resource-added", handleResource);
    };
  }, [workspaceId, limit]);

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

      if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      if (limit && limit > 0) query = query.limit(limit);

      const { data, error: fetchError } = await query;

      if (!isMounted) return;

      if (fetchError) {
        console.log(fetchError);
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
  }, [workspaceId, limit, sessionId]);

  async function handleDeleteResource(resource: Resource) {
    const supabase = getSupabaseBrowserClient();
    setDeletingResourceID(resource?.id);

    try {
      if (resource.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("workspace-resources")
          .remove([resource.storage_path]);

        if (storageError) {
          console.error("Storage delete error:", storageError);
          toast.error(
            "Failed to remove file",
            "Could not delete the file. Please try again.",
          );
          return;
        }
      }

      const { error: deleteError } = await supabase
        .from("workspace_resources")
        .delete()
        .eq("id", resource.id);

      if (deleteError) {
        console.error("Resource delete error:", deleteError);
        toast.error(
          "Failed to remove resource",
          deleteError.message.includes("policy")
            ? "You don't have permission to delete this resource."
            : "Could not remove resource, please try again later.",
        );
        return;
      }

      setResources((prev) => prev.filter((r) => r.id !== resource.id));

      const resourceName =
        resource.type === "file"
          ? resource.file_title || resource.file_name
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
    } catch (error) {
      console.error("Unexpected error deleting resource:", error);
      toast.error(
        "Failed to remove resource",
        "Something went wrong. Please try again.",
      );
    } finally {
      setDeletingResourceID("");
    }
  }

  function addResource(resource: Resource) {
    setResources((prev) => [resource, ...prev]);
  }

  async function updateResource(
    id: string,
    updates: Partial<Pick<Resource, "note_title" | "note_body">>,
  ) {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("workspace_resources")
      .update(updates)
      .eq("id", id)
      .select(
        "*, profiles!workspace_resources_uploaded_by_fkey(name, avatar_url)",
      )
      .single();

    if (error) {
      toast.error("Unable to save note", error.message);
      return null;
    }

    setResources((prev) => prev.map((r) => (r.id === id ? data : r)));

    return data;
  }

  return {
    resources,
    loading,
    error,
    handleDeleteResource,
    addResource,
    deletingResourceID,
    updateResource,
  };
}

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useCallback, useState } from "react";

const WORKSPACE_SELECT = `
  workspace:proposal_workspaces (
    id,
    created_at,
    proposal:proposals(
        id,
        engagement_type,
        sender_id,
        receiver_id,
        teach_skill_id,
        learn_skill_id,
        learn_skill:skills!proposals_learn_skill_id_fkey(
            id,
            title,
            image_url
        ),
        teach_skill:skills!proposals_teach_skill_id_fkey(
            id,
            title,
            image_url
        )
    )
  )
`;

const COUNTERPART_FETCH_CAP = 200;

interface UseUserWorkspacesOptions {
  pageSize?: number;
  counterpartUserId?: string | null;
}

function matchesCounterpart(row: any, counterpartUserId: string) {
  const proposal = row?.workspace?.proposal;
  if (!proposal) return false;
  return (
    proposal.sender_id === counterpartUserId ||
    proposal.receiver_id === counterpartUserId
  );
}

export function useUserWorkspaces(
  userId: string | null,
  options?: UseUserWorkspacesOptions,
) {
  const pageSize = options?.pageSize ?? 5;
  const counterpartUserId = options?.counterpartUserId ?? null;

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchMembersData = useCallback(
    async (limit: number = pageSize) => {
      if (!userId) return [];

      setLoading(true);

      try {
        if (counterpartUserId) {
          const { data, error } = await supabase
            .from("workspace_members")
            .select(WORKSPACE_SELECT)
            .eq("user_id", userId)
            .range(0, COUNTERPART_FETCH_CAP - 1);

          if (error) throw error;

          const filtered = (data ?? []).filter((row) =>
            matchesCounterpart(row, counterpartUserId),
          );

          setWorkspaces(filtered);
          setTotalCount(filtered.length);
          setHasMore(false);

          return filtered;
        }

        const { data, error, count } = await supabase
          .from("workspace_members")
          .select(WORKSPACE_SELECT, { count: "exact" })
          .eq("user_id", userId)
          .range(0, limit - 1);

        if (error) throw error;

        const workspaceData = data ?? [];

        setWorkspaces(workspaceData);
        setTotalCount(count ?? workspaceData.length);
        setHasMore(workspaceData.length === limit);

        return workspaceData;
      } catch (error) {
        console.error("fetch members data error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, supabase, pageSize, counterpartUserId],
  );

  const fetchMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore || counterpartUserId) return [];

    setLoadingMore(true);

    try {
      const from = workspaces.length;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("workspace_members")
        .select(WORKSPACE_SELECT, { count: "exact" })
        .eq("user_id", userId)
        .range(from, to);

      if (error) throw error;

      const workspaceData = data ?? [];

      setWorkspaces((prev) => [...prev, ...workspaceData]);
      setTotalCount(count ?? workspaces.length + workspaceData.length);
      setHasMore(workspaceData.length === pageSize);

      return workspaceData;
    } catch (error) {
      console.error("fetch more members data error:", error);
      throw error;
    } finally {
      setLoadingMore(false);
    }
  }, [
    userId,
    supabase,
    pageSize,
    workspaces.length,
    loadingMore,
    hasMore,
    counterpartUserId,
  ]);

  return {
    workspaces,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    fetchMembersData,
    fetchMore,
  };
}
"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url: string | null;
    rating: number | null;
    exchanges: number;
  };
}

export interface SkillTrack {
  id: string;
  workspace_id: string;
  teacher_id: string;
  learner_id: string;
  skill_id: string;
  skills: {
    id: string;
    title: string;
  };
}

type engagement_type = "swap" | "learn";

interface Workspace {
  id: string;
  created_at: string;
  proposal: {
    id: string;
    engagement_type: engagement_type;
    status: string;
    goal: string | null;
    expected_number_of_sessions: number | null;
    session_duration_minutes: number | null;
    sender_id: string;
    receiver_id: string;
  };
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function useWorkspace(workspaceId: string) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [skillTracks, setSkillTracks] = useState<SkillTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspace = useCallback(async () => {
    if (!workspaceId) return;

    const supabase = getSupabaseBrowserClient();

    setLoading(true);
    setError(null);

    try {
      const [workspaceResult, membersResult, tracksResult] = await Promise.all([
        supabase
          .from("proposal_workspaces")
          .select(
            `
            id,
            created_at,
            proposal:proposals (
                id,
                engagement_type,
                status,
                goal,
                expected_number_of_sessions,
                session_duration_minutes,
                sender_id,
                receiver_id
           )
`,
          )
          .eq("id", workspaceId)
          .maybeSingle(),

        supabase
          .from("workspace_members")
          .select(
            `
              workspace_id,
              user_id,
              joined_at,
              profiles (
                id,
                name,
                avatar_url,
                rating,
                exchanges
              )
            `,
          )
          .eq("workspace_id", workspaceId),

        supabase
          .from("workspace_skill_tracks")
          .select(
            `
              id,
              workspace_id,
              teacher_id,
              learner_id,
              skill_id,
              skills (
                id,
                title
              )
            `,
          )
          .eq("workspace_id", workspaceId),
      ]);

      if (workspaceResult.error) {
        console.log("workspace error");
        console.log(error);
        throw workspaceResult.error;
      }
      if (membersResult.error) throw membersResult.error;
      if (tracksResult.error) throw tracksResult.error;

      // workspaceResult.data -> Workspace
      if (workspaceResult.data) {
        const proposal = first(workspaceResult.data.proposal);
        setWorkspace({
          id: workspaceResult.data.id,
          created_at: workspaceResult.data.created_at,
          proposal: {
            id: proposal?.id,
            engagement_type: proposal?.engagement_type as engagement_type,
            status: proposal?.status,
            goal: proposal?.goal,
            expected_number_of_sessions: proposal?.expected_number_of_sessions,
            session_duration_minutes: proposal?.session_duration_minutes,
            sender_id: proposal?.sender_id,
            receiver_id: proposal?.receiver_id,
          },
        });
      }

      // membersResult.data -> WorkspaceMember[]
      const members: WorkspaceMember[] = (membersResult.data ?? []).map((m) => {
        const profile = first(m.profiles);
        return {
          workspace_id: m.workspace_id,
          user_id: m.user_id,
          joined_at: m.joined_at,
          profiles: {
            id: profile?.id ?? "",
            name: profile?.name ?? "Unknown",
            avatar_url: profile?.avatar_url ?? null,
            rating: profile?.rating ?? null,
            exchanges: profile?.exchanges ?? 0,
          },
        };
      });
      setMembers(members);

      // tracksResult.data -> SkillTrack[]
      const skillTracks: SkillTrack[] = (tracksResult.data ?? []).map((t) => {
        const skill = first(t.skills);
        return {
          id: t.id,
          workspace_id: t.workspace_id,
          teacher_id: t.teacher_id,
          learner_id: t.learner_id,
          skill_id: t.skill_id,
          skills: {
            id: skill?.id ?? "",
            title: skill?.title ?? "",
          },
        };
      });
      setSkillTracks(skillTracks);
    } catch (err) {
      console.error("Workspace fetch error:", err);

      setError(err instanceof Error ? err.message : "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;

    setWorkspace(null);
    setMembers([]);
    setSkillTracks([]);
    setError(null);

    fetchWorkspace();
  }, [workspaceId, fetchWorkspace]);

  //   useEffect(() => {
  //     if (!workspaceId) return;

  //     const supabase = getSupabaseBrowserClient();

  //     const channel = supabase
  //       .channel(`workspace-${workspaceId}`)

  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "*",
  //           schema: "public",
  //           table: "workspace_members",
  //           filter: `workspace_id=eq.${workspaceId}`,
  //         },
  //         () => {
  //           fetchWorkspace();
  //         },
  //       )

  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "*",
  //           schema: "public",
  //           table: "workspace_skill_tracks",
  //           filter: `workspace_id=eq.${workspaceId}`,
  //         },
  //         () => {
  //           fetchWorkspace();
  //         },
  //       )

  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "*",
  //           schema: "public",
  //           table: "proposal_workspaces",
  //           filter: `id=eq.${workspaceId}`,
  //         },
  //         () => {
  //           fetchWorkspace();
  //         },
  //       )

  //       .subscribe();

  //     return () => {
  //       supabase.removeChannel(channel);
  //     };
  //   }, [workspaceId, fetchWorkspace]);

  return {
    workspace,
    members,
    skillTracks,
    loading,
    error,
    refetch: fetchWorkspace,
  };
}

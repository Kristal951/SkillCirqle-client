import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export async function getUserProposals(
  userId: string,
  page: number = 0,
  pageSize: number = 10,
) {
  const supabase = getSupabaseBrowserClient();

  if (!userId) throw new Error("User ID is required");

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("proposals")
    .select(
      `
        id,
        message,
        status,
        engagement_type,
        session_format,
        goal,
        expected_number_of_sessions,
        session_duration_minutes,
        created_at,
        sender:sender_id (
          id,
          name,
          avatar_url
        ),
        receiver:receiver_id (
          id,
          name,
          avatar_url
        ),
      teach_skill:skills!proposals_teach_skill_id_fkey (
        id,
        title
      ),
      learn_skill:skills!proposals_learn_skill_id_fkey (
        id,
        title
      ),
      proposal_workspaces!proposal_workspaces_proposal_id_fkey (
          id
        )
  `,
    )
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getUserProposalStatusCounts(userId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!userId) throw new Error("User ID is required");

  const { data, error } = await supabase
    .from("proposals")
    .select("status")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  if (error) {
    throw new Error(error.message);
  }

  return data as { status: string }[];
}
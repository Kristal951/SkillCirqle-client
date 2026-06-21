import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export async function getUserProposals(userId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!userId) throw new Error("User ID is required");

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
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  console.log(data);
  return data;
}

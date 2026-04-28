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
  teach_skill,
  learn_skill,
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
  )
`,
    )
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

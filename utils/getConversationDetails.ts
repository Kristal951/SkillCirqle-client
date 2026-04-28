import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export const getConversationById = async (
  conversationId: string,
  userId: string,
) => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("dm_conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("me_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

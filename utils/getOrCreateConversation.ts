import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export const getOrCreateConversation = async (
  userA: string,
  userB: string
): Promise<string> => {
  if (!userA || !userB) {
    throw new Error("Both user IDs are required");
  }

  if (userA === userB) {
    throw new Error("Cannot create conversation with yourself");
  }

  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    user_a: userA,
    user_b: userB,
  });
  console.log(data, 'fd')

  if (error) throw error;

  return data as string;
};
import { SupabaseClient } from "@supabase/supabase-js";

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.message.includes("Auth session missing")) {
      return null;
    }
    console.error("Supabase getUser error:", error.message);
    return null;
  }

  return user ?? null;
}
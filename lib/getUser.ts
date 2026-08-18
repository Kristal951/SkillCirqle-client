import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "./supabaseServer";

export async function getUser(supabase?: SupabaseClient) {
  const client = supabase ?? (await createSupabaseServer());
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    if (!error.message.includes("Auth session missing")) {
      console.error("Supabase getUser error:", error.message);
    }
    return null;
  }

  return user ?? null;
}
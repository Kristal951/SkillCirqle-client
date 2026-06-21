import { getSupabaseBrowserClient } from "./supabaseClient";


export async function getProfile( userId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.log(error)
  }
  return data;
}
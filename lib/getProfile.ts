import { getSupabaseBrowserClient } from "./supabaseClient";


export async function getProfile( userId: string) {
  const supabase = getSupabaseBrowserClient()
  console.log(userId)
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

    console.log(data, 'pro')

  if (error) {
    console.log(error)
  }
  return data;
}
import { createSupabaseServer } from "./supabaseServer";

export async function getUser() {
  const supabase = await createSupabaseServer();
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

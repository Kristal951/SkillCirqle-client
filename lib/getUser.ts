import { createSupabaseServer } from "./supabaseServer";

export async function getUser() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;

  return user;
}

import { createSupabaseServer } from "./supabaseServer";

export async function getServerUser() {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("getServerUser error:", error);
    return null;
  }
}
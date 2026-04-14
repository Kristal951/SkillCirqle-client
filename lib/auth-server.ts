import "server-only"; 
import { createSupabaseServer } from "./supabaseServer";

export const getServerUser = async () => {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

export const logoutServer = async () => {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
};
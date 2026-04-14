// lib/auth-server.ts
import "server-only"; 
import { createSupabaseServer } from "./supabaseServer";

/**
 * For use in Server Components, Server Actions, and Route Handlers.
 */

export const getServerUser = async () => {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

// Example of a Server Action for signing out
export const logoutServer = async () => {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
};
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export const changePassword = async (newPassword: string) => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;

  return true;
};

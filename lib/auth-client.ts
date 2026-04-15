// lib/auth-client.ts
import { getSupabaseBrowserClient } from "./supabaseClient";

/**
 * For use in "use client" components, buttons, and forms.
 */

export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  const supabase = await getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: name },
    },
  });

  if (error) throw error;
  return data.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const supabase = await getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
};

export const logout = async () => {
  const supabase = await getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
import { getSupabaseBrowserClient } from "./supabaseClient";

export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  const supabase = getSupabaseBrowserClient();

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
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const factors = data.user?.factors || [];

  const totpFactor = factors.find((f) => f.factor_type === "totp");

  return {
    user: data.user,
    session: data.session,
    requiresMFA: !!totpFactor,
    factor: totpFactor || null,
  };
};

export const logout = async () => {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

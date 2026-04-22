import { createBrowserClient } from "@supabase/ssr";

function getEnvVariables() {
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseURL || !supabaseAnonKey) {
    throw new Error("Missing supabase url or anon key");
  }

  return { supabaseURL, supabaseAnonKey };
}

export function getSupabaseBrowserClient() {
  const { supabaseURL, supabaseAnonKey } = getEnvVariables();

  return createBrowserClient(supabaseURL, supabaseAnonKey);
}
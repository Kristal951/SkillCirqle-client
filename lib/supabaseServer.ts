import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnvVariables() {
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseURL || !supabaseAnonKey) {
    throw new Error("Missing supabase url or anon key");
  }

  return { supabaseURL, supabaseAnonKey };
}

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  const { supabaseURL, supabaseAnonKey } = getEnvVariables();

  return createServerClient(supabaseURL, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch (error) {
          console.log(error, "supabase server client error");
        }
      },
    },
  });
}

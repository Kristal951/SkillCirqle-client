import { createClient } from "@supabase/supabase-js";

function getEnvVariables() {
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseURL || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return { supabaseURL, supabaseServiceKey };
}

const { supabaseURL, supabaseServiceKey } = getEnvVariables();

console.log("🟢 Supabase Admin Initialized");

export const supabaseAdmin = createClient(
  supabaseURL,
  supabaseServiceKey
);
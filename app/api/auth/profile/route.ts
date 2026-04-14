import { getUser } from "@/lib/getUser";
import { getProfile } from "@/lib/getProfile";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServer()
  const user = await getUser();
  const profile = user ? await getProfile(supabase, user.id) : null;

  return Response.json({ user, profile });
}
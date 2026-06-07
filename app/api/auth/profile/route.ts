import { getUser } from "@/lib/getUser";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/utils/cacheHelper";

export async function GET() {
  const supabase = await createSupabaseServer();
  const user = await getUser(supabase)

  let profile = null;

  if (user?.id) {
    profile = await getOrSetCache(
      `profile:${user.id}`,
      async () => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        return data;
      },
      600,
    );
  }

  return Response.json({ user, profile });
}

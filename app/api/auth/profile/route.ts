import { clearStaleAuthCookies } from "@/lib/clearStaleAuthCookies";
import { getUser } from "@/lib/getUser";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/utils/cacheHelper";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createSupabaseServer();
  const user = await getUser(supabase);

  if (!user) {
    await clearStaleAuthCookies();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json({ user, profile });
}

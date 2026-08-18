// /api/user/logout
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { invalidateCache } from "@/utils/cacheHelper";
import { getUser } from "@/lib/getUser";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const user = await getUser(supabase);
  let userId = user?.id ?? null;

  if (!userId) {
    try {
      const body = await request.json();
      userId = body?.userId ?? null;
    } catch {
      userId = null;
    }
  }

  if (userId) {
    await invalidateCache(`profile:${userId}`);
  }

  await supabase.auth.signOut({ scope: "local" });

  const response = NextResponse.json({ success: true });
  response.cookies.set("mfa_session", "", { expires: new Date(0), path: "/" });
  response.cookies.set("mfa_method", "", { expires: new Date(0), path: "/" });

  return response;
}

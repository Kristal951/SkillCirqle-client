
import { getServerUser } from "@/lib/auth-server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { awardTokens } from "@/lib/tokenService";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await awardTokens({
      userId: user?.id,
      amount: 5,
      reason: "onboarding_reward",
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    const status = err.message === "ALREADY_REWARDED" ? 200 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
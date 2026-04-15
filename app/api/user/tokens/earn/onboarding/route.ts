
import { createSupabaseServer } from "@/lib/supabaseServer";
import { awardTokens } from "@/lib/tokenService";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await awardTokens({
      userId: user.id,
      amount: 3,
      reason: "onboarding_reward",
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    const status = err.message === "ALREADY_REWARDED" ? 200 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
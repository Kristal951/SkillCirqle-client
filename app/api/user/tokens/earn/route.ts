import { NextRequest, NextResponse } from "next/server";
import { awardTokens } from "@/lib/tokenService";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json();

    const config: Record<string, { amount: number; reason: string }> = {
      onboarding: { amount: 3, reason: "onboarding_reward" },
      create_post: { amount: 5, reason: "post_reward" },
      daily_login: { amount: 2, reason: "daily_reward" },
    };

    const reward = config[action];
    if (!reward)
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const result = await awardTokens({
      userId: user.id,
      amount: reward.amount,
      reason: reward.reason,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    const isAlreadyRewarded = err.message === "ALREADY_REWARDED";
    return NextResponse.json(
      { error: err.message },
      { status: isAlreadyRewarded ? 200 : 500 },
    );
  }
}

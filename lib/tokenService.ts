import { RewardReason } from "@/app/api/user/tokens/earn/route";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function awardTokens({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number;
  reason: RewardReason
}) {
  const claimed_day =
    reason === "daily_reward"
      ? new Date().toISOString().split("T")[0]
      : null;

  // Insert transaction
  const { error } = await supabaseAdmin
    .from("token_transactions")
    .insert({
      user_id: userId,
      amount,
      reason,
      type: "earn",
      claimed_day,
    });

  // Handle duplicate reward attempts
  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        code: "ALREADY_REWARDED",
        tokens: 0,
        totalEarned: 0,
      };
    }

    throw error;
  }

  // Trigger has already updated the profile.
  // Fetch latest balances.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("skill_tokens, total_earned")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw profileError;
  }

  return {
    tokens: profile.skill_tokens,
    totalEarned: profile.total_earned,
  };
}

export async function spendTokens({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number;
  reason: string;
}) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("skill_tokens")
    .eq("id", userId)
    .single();

  const currentBalance = profile?.skill_tokens ?? 0;

  if (currentBalance < amount) {
    throw new Error("INSUFFICIENT_TOKENS");
  }

  const { error } = await supabaseAdmin.from("token_transactions").insert({
    user_id: userId,
    amount: -Math.abs(amount),
    reason,
    type: "spend",
  });

  if (error) throw error;

  return { success: true, remaining: currentBalance - amount };
}

import { supabaseAdmin } from "./supabaseAdmin";

export async function awardTokens({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number;
  reason: string;
}) {
  if (reason === "onboarding_reward") {
    const { data: existing } = await supabaseAdmin
      .from("token_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("reason", reason);

    if (existing?.length) {
      return {
        success: false,
        code: "ALREADY_REWARDED",
        tokens: 0,
        totalEarned:0
      };
    }
  }

  const { error } = await supabaseAdmin.from("token_transactions").insert({
    user_id: userId,
    amount,
    reason,
    type: "earn",
  });

  if (error) throw error;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("wallet")
    .eq("id", userId)
    .single();

  const { error: walletError } = await supabaseAdmin
    .from("profiles")
    .update({
      wallet: {
        skillTokens: (profile?.wallet?.skillTokens ?? 0) + amount,
        totalEarned: (profile?.wallet?.totalEarned ?? 0) + amount,
      },
    })
    .eq("id", userId);

  if (walletError) throw walletError;

  return {
    tokens: (profile?.wallet?.skillTokens ?? 0) + amount,
    totalEarned: (profile?.wallet?.totalEarned ?? 0) + amount,
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
    .select("wallet")
    .eq("id", userId)
    .single();

  const currentBalance = profile?.wallet?.skillTokens ?? 0;

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

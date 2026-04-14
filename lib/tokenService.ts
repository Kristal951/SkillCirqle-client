import { createClient } from "@supabase/supabase-js";

// Use service_role to ensure token rewards can't be tampered with by users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      .eq("reason", reason)
      .maybeSingle();

    if (existing) throw new Error("ALREADY_REWARDED");
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

  return {
    tokens: profile?.wallet?.skillTokens ?? 0,
    totalEarned: profile?.wallet?.totalEarned ?? 0,
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
  // 1. Check balance first
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("wallet")
    .eq("id", userId)
    .single();

  // Ensure wallet exists and check against the current balance
  const currentBalance = profile?.wallet?.skillTokens ?? 0;

  if (currentBalance < amount) {
    throw new Error("INSUFFICIENT_TOKENS");
  }

  // 2. Log spend (Trigger handles the subtraction automatically)
  // We use -Math.abs to guarantee the number is negative in the DB
  const { error } = await supabaseAdmin.from("token_transactions").insert({
    user_id: userId,
    amount: -Math.abs(amount),
    reason,
    type: "spend",
  });

  if (error) throw error;

  return { success: true, remaining: currentBalance - amount };
}
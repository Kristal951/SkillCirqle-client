import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function isBlockedEitherWay(userIdA: string, userIdB: string) {
  const { data, error } = await supabaseAdmin
    .from("blocked_users")
    .select("blocker_id, blocked_id")
    .or(
      `and(blocker_id.eq.${userIdA},blocked_id.eq.${userIdB}),and(blocker_id.eq.${userIdB},blocked_id.eq.${userIdA})`,
    )
    .limit(1);

  if (error) {
    console.error("isBlockedEitherWay error:", error.message);
    return false; // fail open — don't accidentally lock out legitimate users on a query error
  }

  return (data?.length ?? 0) > 0;
}
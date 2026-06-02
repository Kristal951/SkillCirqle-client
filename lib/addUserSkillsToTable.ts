import { supabaseAdmin } from "./supabaseAdmin";
import { createSupabaseServer } from "./supabaseServer";

export async function addUserSkill(
  userId: string,
  skillId: string,
  type: "teach" | "learn",
) {

  const { error } = await supabaseAdmin.from("user_skills").insert({
    user_id: userId,
    skill_id: skillId,
    type,
  });

  if (error) throw error;
}

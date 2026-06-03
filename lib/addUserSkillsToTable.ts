import { supabaseAdmin } from "./supabaseAdmin";

export async function addUserSkill(
  userId: string,
  skillId: string,
  type: "teach" | "learn",
) {
  const { error } = await supabaseAdmin
    .from("user_skills")
    .upsert(
      {
        user_id: userId,
        skill_id: skillId,
        type,
      },
      {
        onConflict: "user_id,skill_id,type",
      }
    );

  if (error) throw error;
}
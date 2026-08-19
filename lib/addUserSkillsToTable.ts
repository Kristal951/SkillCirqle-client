import { supabaseAdmin } from "./supabaseAdmin";

export async function addUserSkill(
  userId: string,
  skillId: string,
  type: "teach" | "learn",
) {
  const { error } = await supabaseAdmin.from("user_skills").upsert(
    {
      user_id: userId,
      skill_id: skillId,
      type,
    },
    {
      onConflict: "user_id,skill_id,type",
    },
  );

  if (error) throw error;
}

export async function removeUserSkill(
  userId: string,
  skillId: string,
  type: "teach" | "learn",
) {
  const { error } = await supabaseAdmin
    .from("user_skills")
    .delete()
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .eq("type", type);

  if (error) throw error;
}

export async function getUserSkillIds(userId: string, type: "teach" | "learn") {
  const { data, error } = await supabaseAdmin
    .from("user_skills")
    .select("skill_id")
    .eq("user_id", userId)
    .eq("type", type);

  if (error) throw error;
  return (data || []).map((row) => row.skill_id as string);
}

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getSkillCandidatesForEngine(
  userId: string,
  userTeachSkills: Set<string>,
  userLearnSkills: Set<string>,
) {
  const relevantSkillIds = [...userTeachSkills, ...userLearnSkills];

  if (relevantSkillIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("user_skills")
    .select("user_id, skill_id, type, skills:skill_id (title)")
    .in("skill_id", relevantSkillIds)
    .neq("user_id", userId)
    .eq("verified", true);

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

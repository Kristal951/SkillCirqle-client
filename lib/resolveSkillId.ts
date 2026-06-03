import { supabaseAdmin } from "./supabaseAdmin";

export async function resolveSkillId(skill: string) {
  const normalizedSkill = skill.trim().replace(/\s+/g, " ");

  const { data: existing } = await supabaseAdmin
    .from("skills")
    .select("id")
    .eq("title", normalizedSkill)
    .maybeSingle();

  if (existing) return existing.id;

  const slug = normalizedSkill.toLowerCase().replace(/\s+/g, "-");

  const { data: created, error } = await supabaseAdmin
    .from("skills")
    .insert({
      title: normalizedSkill,
      slug,
    })
    .select("id")
    .single();

  if (error) throw error;

  return created.id;
}

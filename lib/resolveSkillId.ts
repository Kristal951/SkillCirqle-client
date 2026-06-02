import { supabaseAdmin } from "./supabaseAdmin";

export async function resolveSkillId(skill: string) {

  const { data: existing } = await supabaseAdmin
    .from("skills")
    .select("*")
    .eq("title", skill)
    .single();

  if (existing) return existing.id;

  const slug = skill.toLowerCase().replace(/\s+/g, "-");

  const { data: created, error } = await supabaseAdmin
    .from("skills")
    .insert({
      title: skill,
      slug,
    })
    .select()
    .single();

  if (error) throw error;

  return created.id;
}

import { supabaseAdmin } from "./supabaseAdmin";

export async function resolveSkillId(skill: string) {
  const normalized = skill.trim().replace(/\s+/g, " ");
  const slug = normalized.toLowerCase().replace(/\s+/g, "-");

  const { data, error } = await supabaseAdmin
    .from("skills")
    .upsert(
      {
        title: normalized,
        slug,
      },
      {
        onConflict: "slug",
      },
    )
    .select("id")
    .single();

  if (error) throw error;

  return data.id;
}

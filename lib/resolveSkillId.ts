import { enqueueAssetGeneration } from "@/utils/ensureSkillExists";
import { supabaseAdmin } from "./supabaseAdmin";

function toTitleCase(input: string): string {
  return input
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      if (
        word.length <= 4 &&
        word === word.toUpperCase() &&
        /[A-Z]/.test(word)
      ) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export async function resolveSkillId(skill: string) {
  const normalized = toTitleCase(skill.trim().replace(/\s+/g, " "));
  const slug = normalized.toLowerCase().replace(/\s+/g, "-");

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("skills")
    .select("id, description, image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    if (!existing.description || !existing.image_url) {
      enqueueAssetGeneration(existing.id, normalized);
    }
    return existing.id;
  }

  const { data, error } = await supabaseAdmin
    .from("skills")
    .upsert({ title: normalized, slug }, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) throw error;

    enqueueAssetGeneration(data.id, normalized);

  return data.id;
}

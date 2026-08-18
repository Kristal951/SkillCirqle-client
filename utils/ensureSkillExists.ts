import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface SkillRecord {
  id: string;
  name: string;
}

export async function enqueueAssetGeneration(skillId: string, skillTitle: string) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URI}/api/skill-data/generate-skill-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
        },
        body: JSON.stringify({ skillId, skillTitle }),
      },
    );
  } catch (err) {
    console.error(`Failed to enqueue asset generation for ${skillTitle}:`, err);
  }
}

export async function ensureSkillsExist(
  skillNames: string[],
): Promise<SkillRecord[]> {
  const normalizedInput = skillNames.map((name) => ({
    original: name.trim(),
    key: name.trim().toLowerCase(),
  }));

  const uniqueKeys = [...new Set(normalizedInput.map((n) => n.key))];
  if (uniqueKeys.length === 0) return [];

  const { data: candidateSkills, error: fetchError } = await supabaseAdmin
    .from("skills")
    .select("id, name")
    .or(uniqueKeys.map((key) => `name.ilike.${key}`).join(","));

  if (fetchError) throw fetchError;

  const existingByKey = new Map(
    (candidateSkills ?? []).map((s) => [s.name.toLowerCase(), s]),
  );

  const seen = new Set<string>();
  const toInsert = normalizedInput.filter((n) => {
    if (existingByKey.has(n.key)) return false;
    if (seen.has(n.key)) return false;
    seen.add(n.key);
    return true;
  });

  let newSkills: SkillRecord[] = [];

  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("skills")
      .insert(toInsert.map((n) => ({ name: n.original })))
      .select("id, name");

    if (insertError) {
      if (insertError.code === "23505") {
        const raceKeys = toInsert.map((n) => n.key);
        const { data: refetched, error: refetchError } = await supabaseAdmin
          .from("skills")
          .select("id, name")
          .or(raceKeys.map((key) => `name.ilike.${key}`).join(","));

        if (refetchError) throw refetchError;
        newSkills = refetched ?? [];
      } else {
        throw insertError;
      }
    } else {
      newSkills = inserted ?? [];
    }

    newSkills.forEach((skill) => {
      enqueueAssetGeneration(skill.id, skill.name);
    });
  }

  return [...(candidateSkills ?? []), ...newSkills];
}

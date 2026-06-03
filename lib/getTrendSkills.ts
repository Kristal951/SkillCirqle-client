import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getTrendingSkills(page = 1, limit = 10) {
  const { data, error } = await supabaseAdmin.from("user_skills").select(`
      skill_id,
      skills (
        id,
        title,
        slug
      )
    `);

  if (error) throw error;

  const counts = new Map();

  for (const row of data || []) {
    const skill = row.skills as any;

    if (!skill) continue;

    const existing = counts.get(skill.id);

    counts.set(skill.id, {
      id: skill.id,
      title: skill.title,
      slug: skill.slug,
      count: existing ? existing.count + 1 : 1,
    });
  }

  const skills = Array.from(counts.values()).sort((a, b) => b.count - a.count);

  const total = skills.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    skills: skills.slice(start, end),
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    limit,
    hasMore: end < total,
  };
}

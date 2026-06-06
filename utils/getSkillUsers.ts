import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getUsersBySkill(skillId: string, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("user_skills")
    .select(
      `
      user_id,
      profiles (
        id,
        avatar_url,
        name
      )
    `,
      { count: "exact" },
    )
    .eq("skill_id", skillId)
    .eq("type", "teach")
    .range(from, to);

  if (error) throw error;

  return {
    users:
      data?.map((row: any) => ({
        id: row.profiles.id,
        avatar_url: row.profiles.avatar_url,
        username: row.profiles.username,
        full_name: row.profiles.full_name,
      })) || [],
    total: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit),
    hasMore: to < (count || 0),
  };
}

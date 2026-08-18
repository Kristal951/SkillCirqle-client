import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getUsersBySkill(
  skillId: string,
  page = 1,
  limit = 10,
  verified = false,
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
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
    .eq("type", "teach");

  if (verified) {
    query = query.eq("verified", true);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    users: (data || [])
      .filter((row: any) => row.profiles !== null)
      .map((row: any) => ({
        id: row.profiles.id,
        avatar_url: row.profiles.avatar_url,
        name: row.profiles.name,
      })),
    total: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit),
    hasMore: to < (count || 0),
  };
}

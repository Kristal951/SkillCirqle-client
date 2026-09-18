import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SkillResults from "./SkillResults";

export default async function SkillSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam, limit: limitParam } = await searchParams;

  const page = Number(pageParam ?? 1);
  const limit = Number(limitParam ?? 20);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: skill, error: skillError } = await supabaseAdmin
    .from("skills")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (skillError || !skill) {
    notFound();
  }

  const { count, error: countError } = await supabaseAdmin
    .from("user_skills")
    .select("*", { count: "exact", head: true })
    .eq("skill_id", skill.id)
    .eq("type", "teach")
    .eq("verified", true);

  if (countError) {
    throw countError;
  }

  const { data: userSkills, error: userSkillsError } = await supabaseAdmin
    .from("user_skills")
    .select("user_id")
    .eq("skill_id", skill.id)
    .eq("type", "teach")
    .eq("verified", true)
    .range(from, to);

  if (userSkillsError) {
    throw userSkillsError;
  }

  const userIds = [...new Set(userSkills.map((u) => u.user_id))];

  let users: any[] = [];

  if (userIds.length > 0) {
    const { data: profiles, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select(
        `
        id,
        name,
        rating,
        avatar_url,
        bio,
        skills_to_teach
      `,
      )
      .in("id", userIds);

    if (usersError) {
      throw usersError;
    }

    users = profiles ?? [];
  }

  const data = {
    skill,
    users,
    total: count ?? 0,
    currentPage: page,
    totalPages: Math.ceil((count ?? 0) / limit),
    limit,
    hasMore: page * limit < (count ?? 0),
  };

  return <SkillResults data={data} />;
}
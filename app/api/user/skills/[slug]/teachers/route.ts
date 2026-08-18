import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const searchParams = request.nextUrl.searchParams;

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: skill, error: skillError } = await supabaseAdmin
      .from("skills")
      .select("id, title, slug")
      .eq("slug", slug)
      .single();

    if (skillError || !skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
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
      .range(from, to)
      .eq("verified", true);

    if (userSkillsError) {
      throw userSkillsError;
    }

    const userIds = [...new Set(userSkills.map((u) => u.user_id))];

    if (userIds.length === 0) {
      return NextResponse.json({
        skill,
        users: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        hasMore: false,
      });
    }

    const { data: users, error: usersError } = await supabaseAdmin
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

    return NextResponse.json({
      skill,
      users: users ?? [],
      total: count ?? 0,
      currentPage: page,
      totalPages: Math.ceil((count ?? 0) / limit),
      limit,
      hasMore: page * limit < (count ?? 0),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

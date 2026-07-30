import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/server-auth";
import { getUserSkillsFromTable } from "@/utils/getUserSkillsFromTable";
import { runSkillSuggestionEngine } from "@/lib/SkillMatchingEngine";

export async function GET(req: NextRequest) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") || 1);
  const limit = Number(req.nextUrl.searchParams.get("limit") || 20);

  const skillData = await getUserSkillsFromTable(user.id);
  const userSkills = skillData?.success ? skillData?.skills : [];
  console.log(userSkills)

  const result = await runSkillSuggestionEngine({
    userId: user.id,
    userSkills,
    page,
    limit,
  });

  return NextResponse.json(result);
}

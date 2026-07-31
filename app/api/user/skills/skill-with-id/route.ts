import { getServerUser } from "@/lib/server-auth";
import { getUserSkillsFromTable } from "@/utils/getUserSkillsFromTable";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") || undefined;
  const requestedUserId = req.nextUrl.searchParams.get("userId");
  const targetUserId = requestedUserId || user.id;

  const result = await getUserSkillsFromTable(targetUserId, type);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ skills: result.skills });
}
import { getUser } from "@/lib/getUser";
import { getTrendingSkillCards } from "@/utils/getTrendingSkillsWithUsers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const user = await getUser();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const result = await getTrendingSkillCards(page, limit, user?.id)

  return NextResponse.json(result);
}
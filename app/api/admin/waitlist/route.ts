import { createSupabaseServer } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search")?.trim() ?? "";
  const sortOrder = searchParams.get("sort") === "asc" ? "asc" : "desc";
  const cursorCreatedAt = searchParams.get("cursorCreatedAt");
  const cursorId = searchParams.get("cursorId");

  let query = supabase
    .from("waitlist_signups")
    .select("id, email, created_at")
    .order("created_at", { ascending: sortOrder === "asc" })
    .order("id", { ascending: sortOrder === "asc" })
    .limit(PAGE_SIZE + 1);

  if (search) {
    query = query.ilike("email", `%${search}%`);
  }

  if (cursorCreatedAt && cursorId) {
    const op = sortOrder === "asc" ? "gt" : "lt";
    query = query.or(
      `created_at.${op}.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.${op}.${cursorId})`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Waitlist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const hasMore = data.length > PAGE_SIZE;
  const rows = hasMore ? data.slice(0, PAGE_SIZE) : data;

  return NextResponse.json({ rows, hasMore });
}

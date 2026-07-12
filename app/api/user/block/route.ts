import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getUser } from "@/lib/getUser";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const blockedId = body?.userId;

  if (!blockedId || typeof blockedId !== "string") {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (blockedId === user.id) {
    return NextResponse.json(
      { error: "You cannot block yourself." },
      { status: 400 },
    );
  }

  const { error: insertError } = await supabase.from("blocked_users").insert({
    blocker_id: user.id,
    blocked_id: blockedId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ success: true, alreadyBlocked: true });
    }
    console.error("block insert error:", insertError.message);
    return NextResponse.json(
      { error: "Failed to block user." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

import { getUser } from "@/lib/getUser";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: conversationId } = await params;
  const supabase = await createSupabaseServer();

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const muted = body?.muted;

  if (typeof muted !== "boolean") {
    return NextResponse.json(
      { error: "muted must be a boolean." },
      { status: 400 },
    );
  }

  const { data: membership, error: membershipError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    console.error("mute membership check error:", membershipError.message);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }

  if (!membership) {
    return NextResponse.json(
      { error: "You are not a participant in this conversation." },
      { status: 403 },
    );
  }

  const { error: updateError } = await supabase
    .from("conversation_participants")
    .update({ muted })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("mute update error:", updateError.message);
    return NextResponse.json(
      { error: "Failed to update setting." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, muted });
}

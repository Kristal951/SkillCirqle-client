import { getUser } from "@/lib/getUser";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: conversationId } = await params;
  const supabase = await createSupabaseServer();

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    console.error(
      "clear-chat membership check error:",
      membershipError.message,
    );
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
    .update({ cleared_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("clear-chat update error:", updateError.message);
    return NextResponse.json(
      { error: "Failed to clear chat." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

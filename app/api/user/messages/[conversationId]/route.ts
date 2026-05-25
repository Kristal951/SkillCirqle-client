import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { decryptMessage } from "@/lib/decryptMessage";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("messages")
      .select(
        `
    *,
    sender:profiles(*),

    reply:reply_to (
      id,
      content,
      sender_id,
      metadata
    )
  `,
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const decryptedMessages = data.map((msg) => ({
      ...msg,
      content: decryptMessage(msg.content),
    }));

    return NextResponse.json(decryptedMessages);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

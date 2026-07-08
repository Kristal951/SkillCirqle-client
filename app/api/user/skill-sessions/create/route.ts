import { getServerUser } from "@/lib/server-auth";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, sessionType, recipientId } = body;
    const supabase = await createSupabaseServer()

    if (!chatId || !sessionType || !recipientId) {
      return NextResponse.json(
        { error: "Missing required fields: chatId, sessionType, or recipientId" },
        { status: 400 }
      );
    }
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = crypto.randomUUID(); 

  
    return NextResponse.json({ roomId }, { status: 201 });
  } catch (error) {
    console.error("Session provisioning route error:", error);
    return NextResponse.json(
      { error: "Internal server validation engine failure" },
      { status: 500 }
    );
  }
}
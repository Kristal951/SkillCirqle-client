import { getServerUser } from "@/lib/server-auth";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, sessionType, recipientId } = body;

    if (!chatId || !sessionType || !recipientId) {
      return NextResponse.json(
        {
          error: "Missing required fields: chatId, sessionType, or recipientId",
        },
        { status: 400 },
      );
    }
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : uuidv4();

    return NextResponse.json({ roomId }, { status: 201 });
  } catch (error) {
    console.error("Session provisioning route error:", error);
    return NextResponse.json(
      { error: "Internal server validation engine failure" },
      { status: 500 },
    );
  }
}

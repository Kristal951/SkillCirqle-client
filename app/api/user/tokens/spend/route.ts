import { NextRequest, NextResponse } from "next/server";
import { spendTokens } from "@/lib/tokenService";
import { getSessionUser } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    console.warn("🔴 Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, reason } = await req.json();
    const userId = user.uid;

    await spendTokens({ userId, amount, reason });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

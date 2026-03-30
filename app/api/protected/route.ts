export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);

    return NextResponse.json({
      message: "Secure data",
      user: user.uid,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth-actions";
import { getServerUser } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  const user = await getServerUser(req);
  if (user?.uid) {
    try {
      await logoutUser(user.uid);
    } catch (err) {
      console.error("LOGOUT_BACKEND_ERROR:", err);
    }
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });

  return res;
}

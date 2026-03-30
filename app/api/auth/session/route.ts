export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth-actions";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const { sessionCookie, expiresIn } = await createSession(token);

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: expiresIn / 1000,
    path: "/",
  });

  return res;
}
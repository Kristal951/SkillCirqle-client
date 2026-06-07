import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("mfa_session", "", { expires: new Date(0), path: "/" });
  response.cookies.set("mfa_method", "", { expires: new Date(0), path: "/" });

  return response;
}

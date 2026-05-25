import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/server-auth";

const hashCode = (code: string) => {
  if (!process.env.MFA_RECOVERY_SECRET) {
    throw new Error("MFA_RECOVERY_SECRET is not set");
  }

  return crypto
    .createHmac("sha256", process.env.MFA_RECOVERY_SECRET)
    .update(code.trim().toUpperCase())
    .digest("hex");
};

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    const user = await getServerUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { recoveryCode } = body;

    if (!recoveryCode) {
      return Response.json(
        { error: "Recovery code required" },
        { status: 400 },
      );
    }

    const hashedCode = hashCode(recoveryCode);

    const { data: code, error } = await supabase
      .from("mfa_recovery_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("code_hash", hashedCode)
      .eq("used", false)
      .single();

    if (error || !code) {
      return Response.json({ error: "Invalid recovery code" }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from("mfa_recovery_codes")
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id", code.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Recovery code verified",
    });

    response.cookies.set("mfa_verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    response.cookies.set("mfa_method", "recovery_code", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30 * 24,
    });

    response.cookies.set(
      "mfa_session",
      crypto
        .createHash("sha256")
        .update(session?.access_token || "")
        .digest("hex"),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 30,
      },
    );

    return response;
  } catch (err) {
    console.error("Recovery verification error:", err);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

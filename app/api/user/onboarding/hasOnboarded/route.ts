import { getServerUser } from "@/lib/server-auth";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("profiles")
      .select("has_onboarded, onboarding_step")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ hasOnboarded: false, step: 0 });
    }

    return NextResponse.json({
      hasOnboarded: data.has_onboarded,
      step: data.onboarding_step,
    });
  } catch (error) {
    console.error("Onboarding GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

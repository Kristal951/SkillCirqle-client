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
      .select("onboarding_step")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({
      step: data?.onboarding_step ?? 1,
    });
  } catch (error) {
    console.error("GET onboarding error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const step = parseInt(body.step, 10);

    if (isNaN(step) || step < 0 || step > 10) {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    const { data, error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        onboarding_step: step,
        has_onboarded: step >= 2,
      },
      { onConflict: "id" },
    ).select("onboarding_step");

    if (error) {
      console.log(error);
      throw error;
    }

    return NextResponse.json({ success: true, step: data?.[0]?.onboarding_step });
  } catch (error) {
    console.error("POST onboarding error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

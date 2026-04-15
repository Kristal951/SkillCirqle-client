import { getServerUser } from "@/lib/server-auth";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body;

    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Invalid updates payload" },
        { status: 400 },
      );
    }

    const allowedFields: Record<string, string> = {
      bio: "bio",
      location: "location",
      role: "role",
      skills_to_teach: "skills_to_teach",
      skills_to_learn: "skills_to_learn",
      has_onboarded: "has_onboarded",
      avatar_url: "avatar_url",
    };

    const filteredUpdates: Record<string, any> = {};

    for (const [jsonKey, dbColumn] of Object.entries(allowedFields)) {
      if (updates[jsonKey] !== undefined) {
        filteredUpdates[dbColumn] = updates[jsonKey];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServer();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        ...filteredUpdates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH error:", error?.message || error);

    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 },
    );
  }
}

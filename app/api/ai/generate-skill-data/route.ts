import { generateSkillAssets } from "@/actions/generateSkillData";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function isValidAuthHeader(authHeader: string | null): boolean {
  const expected = `Bearer ${process.env.WEBHOOK_SECRET}`;
  if (!authHeader || authHeader.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!isValidAuthHeader(authHeader)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = await req.json();
    const record = payload?.record;

    if (!record?.id) {
      return NextResponse.json(
        { error: "Missing ID or Title" },
        { status: 400 },
      );
    }

    const { id } = record;

    const supabase = await createSupabaseServer();
    const { data: skill, error: skillError } = await supabase
      .from("skills")
      .select("id, title, description, image_url")
      .eq("id", id)
      .single();

    if (skillError || !skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    if (skill.description && skill.image_url) {
      return NextResponse.json(
        { message: "Assets already generated, skipping" },
        { status: 200 },
      );
    }

    const result = await generateSkillAssets(skill.id, skill.title);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: "Success", data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
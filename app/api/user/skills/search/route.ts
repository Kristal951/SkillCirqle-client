import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createSupabaseServer();
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ skills: [] });
    }

    const { data, error } = await supabase
      .from("skills")
      .select(
        `
        id,
        title,
        slug,
        image_url,
        category_id,
        subcategory_id
      `,
      )
      .textSearch("search_vector", query, {
        type: "websearch",
      })
      .limit(10);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to fetch skills" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      skills: data || [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

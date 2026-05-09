import { NextResponse } from "next/server";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({
        skills: [],
      });
    }

    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("skills")
      .select(`
        id,
        title,
        slug,
        image_url,
        category
      `)
      .textSearch("search_vector", query)
      .limit(10);

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: "Failed to fetch skills",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      skills: data || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
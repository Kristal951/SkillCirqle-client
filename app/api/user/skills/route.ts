import { createSupabaseServer } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/utils/cacheHelper";

export async function GET() {
  const supabase = await createSupabaseServer();

  const skills = await getOrSetCache(
    "skills:all",
    async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("id, title, slug, category_id")
        .order("title");

      if (error) throw error;
      return data;
    },
    3600,
  );

  return Response.json({ skills });
}


import { createSupabaseServer } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/utils/cacheHelper";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "Missing user id" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  let profile = null;

  try {
    profile = await getOrSetCache(
      `profile:${id}:with-skills`,
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            name,
            avatar_url,
            bio,
            user_skills (
              skill_id,
              type,
              skills (
                id,
                title
              )
            )
          `,
          )
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      600,
    );
  } catch (err: any) {
    console.error(`Profile fetch error for id ${id}:`, err);
    return Response.json(
      { error: err?.message || "Failed to fetch profile" },
      { status: 500 },
    );
  }

  if (!profile) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ profile });
}

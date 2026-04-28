import { createSupabaseServer } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServer();
  const { id } = await params;
  console.log(id, "id");

  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (error) {
    console.log(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ user });
}

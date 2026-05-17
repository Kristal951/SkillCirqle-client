import { createSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/server-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServer();

    const user = await getServerUser();

    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from("user_sessions")
      .update({
        revoked: true,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        success: false,
        error: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

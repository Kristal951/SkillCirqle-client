import { createSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/server-auth";

export async function POST() {
  try {
    const supabase = await createSupabaseServer();

    const user = await getServerUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { error } = await supabase
      .from("user_sessions")
      .update({
        revoked: true,
      })
      .eq("user_id", user.id)
      .eq("is_current", false);

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

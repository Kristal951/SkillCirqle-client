import { getServerUser } from "@/lib/server-auth";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createSupabaseServer();

  const user = await getServerUser();

  if (!user) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  const reason = typeof body?.reason === "string" ? body.reason.trim() : null;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5." },
      { status: 400 },
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("skill_sessions")
    .select("host_id, guest_id, status")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const isHost = session.host_id === user.id;
  const isGuest = session.guest_id === user.id;

  if (!isHost && !isGuest) {
    return NextResponse.json(
      { error: "You were not a participant in this session." },
      { status: 403 },
    );
  }

  if (isHost) {
    return NextResponse.json(
      { error: "Only the learner can rate a session." },
      { status: 403 },
    );
  }

  const ratedUserId = session.host_id;

  const { error: insertError } = await supabase.from("session_ratings").insert({
    session_id: sessionId,
    rater_id: user.id,
    rated_user_id: ratedUserId,
    rating,
    reason,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You've already rated this session." },
        { status: 409 },
      );
    }
    console.error("session_ratings insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to submit rating." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("session_ratings")
    .select("rating, reason")
    .eq("session_id", sessionId)
    .eq("rater_id", user.id)
    .maybeSingle();

  return NextResponse.json({ existingRating: data ?? null });
}

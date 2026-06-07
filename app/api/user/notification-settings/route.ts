import { getUser } from "@/lib/getUser";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createSupabaseServer();

   const user = await getUser()

    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json();

    const { error } = await supabase
      .from("notification_settings")
      .update(body)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}

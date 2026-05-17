import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/getUser";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const isDev = process.env.NODE_ENV === "development";

    const geo = {
      country: req.headers.get("cf-ipcountry") || (isDev ? "DEV" : null),
      city: req.headers.get("cf-ipcity") || (isDev ? "Localhost" : null),
      region: req.headers.get("cf-region") || (isDev ? "Dev" : null),
      timezone: req.headers.get("cf-timezone") || (isDev ? "Local" : null),
    };
    const supabase = await createSupabaseServer();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.rpc("set_current_session", {
      p_user_id: user.id,
      p_session_id: body.session_id,
      p_device_name: body.device_name,
      p_browser: body.browser,
      p_os: body.os,
      p_ip: ip,
      p_user_agent: body.user_agent,
      p_location: geo,
    });

    if (error) {
      console.log(error);

      return NextResponse.json(
        { error: "RPC failed", details: error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("last_active", { ascending: false });

    if (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 },
      );
    }

    return NextResponse.json({ sessions: data });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// app/api/tokens/earn/route.ts

import { NextRequest, NextResponse } from "next/server";
import { awardTokens } from "@/lib/tokenService";
import { getSessionUser } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    let amount = 0;
    let reason = "";

    switch (action) {
      case "create_post":
        amount = 5;
        reason = "post_reward";
        break;

      case "daily_login":
        amount = 2;
        reason = "daily_reward";
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await awardTokens({
      userId: user.uid,
      amount,
      reason,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    if (err.message === "ALREADY_REWARDED") {
      return NextResponse.json({ message: "Already rewarded" });
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
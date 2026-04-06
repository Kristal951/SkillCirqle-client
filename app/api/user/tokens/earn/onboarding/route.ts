import { NextRequest, NextResponse } from "next/server";
import { awardTokens } from "@/lib/tokenService";
import { getSessionUser } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user?.profile?.hasOnboarded) {
      return NextResponse.json(
        { error: "User has not completed onboarding process." },
        { status: 403 },
      );
    }

    const result = await awardTokens({
      userId: user.uid,
      amount: 3,
      reason: "onboarding_reward",
    });

    return NextResponse.json({
      success: true,
      tokens: result.tokens,
      total: result.totalEarned,
    });
  } catch (err: any) {
    if (err.message === "ALREADY_REWARDED") {
      return NextResponse.json({ message: "Already rewarded" });
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

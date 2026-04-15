import { createSupabaseServer } from "@/lib/supabaseServer";
// Import your admin client that uses SERVICE_ROLE_KEY
import { awardTokens, spendTokens } from "@/lib/tokenService"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  
  try {
    // 1. Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, reason } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const result = await spendTokens({
      userId: user.id,
      amount,
      reason: reason || "token_spend",
    });

    return NextResponse.json({ success: true, remaining: result.remaining });

  } catch (err: any) {
    console.error("🔴 Spend Tokens Error:", err.message);
    
    // Handle specific error messages
    const status = err.message === "INSUFFICIENT_TOKENS" ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
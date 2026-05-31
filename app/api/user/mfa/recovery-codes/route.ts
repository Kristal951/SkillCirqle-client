import { getServerUser } from "@/lib/server-auth";
import { createSupabaseServer } from "@/lib/supabaseServer";
import crypto from "crypto";

const generateRecoveryCodes = (count = 8) => {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase(),
  );
};

const hashCode = (code: string) => {
  if (!process.env.MFA_RECOVERY_SECRET) {
    throw new Error("MFA_RECOVERY_SECRET is not set");
  }

  return crypto
    .createHmac("sha256", process.env.MFA_RECOVERY_SECRET)
    .update(code)
    .digest("hex");
};

export async function POST() {
  const supabase = await createSupabaseServer();

  const user = await getServerUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await supabase.from("mfa_recovery_codes").delete().eq("user_id", user.id);

    const codes = generateRecoveryCodes();

    const hashedCodes = codes.map((code) => ({
      user_id: user.id,
      code_hash: hashCode(code),
      used: false,
    }));

    const { error } = await supabase
      .from("mfa_recovery_codes")
      .insert(hashedCodes);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      codes,
    });
  } catch (err: any) {
    console.error("Recovery code generation error:", err);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const supabase = await createSupabaseServer();
  const user = await getServerUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await supabase.from("mfa_recovery_codes").delete().eq("user_id", user.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting recovery codes:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

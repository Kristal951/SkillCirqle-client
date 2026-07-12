import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabaseServer";

export type AdminRole = "admin" | "super_admin";

interface AdminCheckResult {
  isAdmin: boolean;
  userId: string | null;
  role: string | null;
}

const ADMIN_ROLES: AdminRole[] = ["admin", "super_admin"];

export async function checkIsAdmin(): Promise<AdminCheckResult> {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false, userId: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? null;

  return {
    isAdmin: !!role && ADMIN_ROLES.includes(role as AdminRole),
    userId: user.id,
    role,
  };
}

export async function checkIsAdminWithClient(
  supabase: SupabaseClient,
  userId: string,
): Promise<Omit<AdminCheckResult, "userId"> & { userId: string }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const role = profile?.role ?? null;

  return {
    isAdmin: !!role && ADMIN_ROLES.includes(role as AdminRole),
    userId,
    role,
  };
}


export async function requireAdmin(): Promise<AdminCheckResult> {
  const result = await checkIsAdmin();
  if (!result.isAdmin) {
    throw new Error("Forbidden: admin access required");
  }
  return result;
}

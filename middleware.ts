import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { checkIsAdminWithClient } from "./utils/isAdmin";
import { getSessionIdFromAccessToken } from "./lib/auth/session-claims";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  const path = request.nextUrl.pathname;

  if (path === "/") {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isUpdatePasswordPage = path === "/auth/update-password";
  const isAuthPage =
    path.startsWith("/auth") &&
    !path.startsWith("/auth/mfa") &&
    !isUpdatePasswordPage;
  const isAdminPage = path.startsWith("/admin");
  const isVerifyEmailPage = path.startsWith("/auth/verify-email");
  const isMfaRoute = path.startsWith("/auth/mfa");
  const isProtectedRoute = ["/dashboard", "/onboarding"].some((p) =>
    path.startsWith(p),
  );

  if (session) {
    const sessionId = getSessionIdFromAccessToken(session.access_token);

    if (sessionId) {
      const { data: sessionRow } = await supabase
        .from("user_sessions")
        .select("revoked")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (sessionRow?.revoked) {
        await supabase.auth.signOut();
        const url = new URL("/auth/signin", request.url);
        url.searchParams.set("error", "session_revoked");
        return NextResponse.redirect(url);
      }
    }
  }

  if (isAdminPage) {
    if (!user) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("error", "unauthorized");
      url.searchParams.set("redirect", request.nextUrl.pathname);

      return NextResponse.redirect(url);
    }

    const { isAdmin } = await checkIsAdminWithClient(supabase, user.id);

    if (!isAdmin) {
      const url = new URL("/dashboard", request.url);
      url.searchParams.set("error", "admin_required");
      return NextResponse.redirect(url);
    }
  }

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  if (user) {
    const isEmailProvider = user.app_metadata?.provider === "email";
    const isEmailVerified = !!user.email_confirmed_at;

    if (isEmailProvider && !isEmailVerified && !isVerifyEmailPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/verify-email";
      url.searchParams.set("email", user.email!);
      return NextResponse.redirect(url);
    }

    if (isEmailVerified) {
      const encoder = new TextEncoder();
      const data = encoder.encode(session?.access_token || "");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const sessionHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const trustedMfa =
        request.cookies.get("mfa_session")?.value === sessionHash;

      const { data: mfaData, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      let mfaSatisfied = true;

      if (!error && mfaData) {
        const { currentLevel, nextLevel } = mfaData;
        const requiresMfa = nextLevel === "aal2" && currentLevel === "aal1";
        mfaSatisfied = !requiresMfa || trustedMfa;

        if (requiresMfa && !trustedMfa && isProtectedRoute) {
          const url = request.nextUrl.clone();
          url.pathname = "/auth/mfa/verify";
          return NextResponse.redirect(url);
        }

        if (mfaSatisfied && (isAuthPage || isMfaRoute)) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }

      if (isAuthPage && mfaSatisfied) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/auth|$).*)",
  ],
};

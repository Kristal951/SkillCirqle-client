import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { checkIsAdminWithClient } from "./utils/isAdmin";
import { getSessionIdFromAccessToken } from "./lib/auth/session-claims";

const INVALID_REFRESH_CODES = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
]);

const PUBLIC_ROUTES = ["/", "/legal", "/help_center"];

function isInvalidRefreshTokenError(
  error: { code?: string; status?: number } | null | undefined,
) {
  if (!error) return false;
  return INVALID_REFRESH_CODES.has(error.code ?? "") || error.status === 400;
}

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.delete(cookie.name);
    }
  });
  return response;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  const path = request.nextUrl.pathname;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    return path === route || path.startsWith(`${route}/`);
  });

  if (isPublicRoute) {
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
    error: userError,
  } = await supabase.auth.getUser();

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

  if (isInvalidRefreshTokenError(userError)) {
    await supabase.auth.signOut({ scope: "local" });

    if (!isAuthPage) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("error", "session_expired");
      if (isProtectedRoute || isAdminPage) {
        url.searchParams.set("redirect", path);
      }
      return clearAuthCookies(NextResponse.redirect(url), request);
    }

    return clearAuthCookies(response, request);
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (isInvalidRefreshTokenError(sessionError) && !isAuthPage) {
    await supabase.auth.signOut({ scope: "local" });
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("error", "session_expired");
    if (isProtectedRoute || isAdminPage) {
      url.searchParams.set("redirect", path);
    }
    return clearAuthCookies(NextResponse.redirect(url), request);
  }

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
        return clearAuthCookies(NextResponse.redirect(url), request);
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|woff|woff2|ttf|eot)$|api/auth|api/user/logout|$).*)",
  ],
};

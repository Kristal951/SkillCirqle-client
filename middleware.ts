import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

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
              request: {
                headers: request.headers,
              },
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

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/auth") && !path.startsWith("/auth/mfa");
  const isProtectedRoute = ["/dashboard", "/onboarding"].some((p) =>
    path.startsWith(p),
  );
  const isMfaRoute = path.startsWith("/auth/mfa");
  const mfaVerified = request.cookies.get("mfa_verified")?.value === "true";
  const encoder = new TextEncoder();
  const data = encoder.encode(session?.access_token || "");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const sessionHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const trustedMfa = request.cookies.get("mfa_session")?.value === sessionHash;

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: mfaData, error } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (!error && mfaData) {
      const { currentLevel, nextLevel } = mfaData;

      const requiresMfa = nextLevel === "aal2" && currentLevel === "aal1";

      if (requiresMfa && !trustedMfa && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/mfa/verify";
        return NextResponse.redirect(url);
      }

      if ((!requiresMfa || trustedMfa) && (isAuthPage || isMfaRoute)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};

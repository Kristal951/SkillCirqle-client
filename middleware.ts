import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Ignore Next.js internals & static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") // covers .css, .js, .png, etc.
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session")?.value;

  const isAuthPage = pathname.startsWith("/auth");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  // 🚫 Not logged in → block protected routes
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // 🚫 Logged in → prevent auth pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
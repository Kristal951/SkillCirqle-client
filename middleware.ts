import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "./lib/server-auth";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;

  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (session && isAuthPage) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/auth/:path*"],
};

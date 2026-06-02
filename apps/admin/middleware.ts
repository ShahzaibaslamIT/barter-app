import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Defense-in-depth gate for the admin app. The PRIMARY auth checks still live in
// the Node-runtime route handlers (`getAdminFromRequest`) and the
// `(protected)/layout.tsx` server guard (`getAdminFromCookies`), which actually
// VERIFY the JWT. Middleware runs on the Edge runtime where `jsonwebtoken` is
// unavailable, so this only does a fast cookie-PRESENCE check — it blocks
// anonymous traffic early; a present-but-invalid token is still rejected
// downstream by the verifying guards.
const ADMIN_COOKIE = "admin_token";

// Reachable without a session: the login page and the auth endpoints
// (login/logout/me) it calls.
function isPublic(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/api/auth");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const hasToken = Boolean(request.cookies.get(ADMIN_COOKIE));
  if (!hasToken) {
    // API routes get a JSON 401; pages get redirected to login.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next.js internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$).*)",
  ],
};

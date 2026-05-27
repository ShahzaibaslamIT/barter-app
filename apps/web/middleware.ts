import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_COOKIE = "admin_token";

const BLOCKED_STATUSES = new Set(["suspended", "banned", "blacklisted"]);

// Routes that should remain reachable even when the session user is suspended
// (login flow, status banner data, sign-out).
const STATUS_EXEMPT_PATHS = [
  "/auth",
  "/api/auth", // NextAuth + custom /api/auth/* routes
  "/api/user/me", // StatusBanner polls this to learn it's blocked
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect admin UI pages (except login) ──────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(ADMIN_COOKIE);
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ── Protect admin API routes (except auth endpoints) ───────
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const token = request.cookies.get(ADMIN_COOKIE);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── Moderation gate: log out suspended / banned / blacklisted users ─
  // Skip paths that the user must still reach (login screen, status read).
  const isExempt = STATUS_EXEMPT_PATHS.some((p) => pathname.startsWith(p));
  if (!isExempt && !pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    const jwt = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const status = (jwt as any)?.user_status as string | undefined;
    if (status && BLOCKED_STATUSES.has(status)) {
      // API: 403 JSON. Page: redirect to /auth with status code so the auth page can render a reason.
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Account blocked", status_code: status.toUpperCase() },
          { status: 403 }
        );
      }
      const url = new URL("/auth", request.url);
      url.searchParams.set("error", "AccountBlocked");
      url.searchParams.set("status", status);
      return NextResponse.redirect(url);
    }
  }

  // ── Inject pathname so server layout components can read it ─
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  // Run middleware on every route except the Next.js internals and static assets.
  // The admin matcher used to be narrower; widening it lets the moderation gate
  // see non-admin traffic too while still skipping image/manifest/serviceworker paths.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|favicon-96x96.png|apple-touch-icon.png|site.webmanifest|sw.js|OneSignalSDKWorker.js|firebase-messaging-sw.js|offline.html|uploads/|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|webmanifest)$).*)",
  ],
};

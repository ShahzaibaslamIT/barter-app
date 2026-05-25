import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET as string;
export const ADMIN_COOKIE = "admin_token";
export const SESSION_MINUTES = 30;

export interface AdminTokenPayload {
  admin_id: number;
  email: string;
  name: string;
  role: AdminRole;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_MINUTES}m` });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

/** Use in API route handlers (reads from request cookies) */
export function getAdminFromRequest(request: NextRequest): AdminTokenPayload | null {
  const cookie = request.cookies.get(ADMIN_COOKIE);
  if (!cookie) return null;
  return verifyAdminToken(cookie.value);
}

/** Use in Server Components (reads from next/headers) */
export async function getAdminFromCookies(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// ─── RBAC ───────────────────────────────────────────────────

type Permission =
  | "users:view"
  | "users:edit"
  | "users:suspend"
  | "users:ban"
  | "users:delete"
  | "listings:view"
  | "listings:moderate"
  | "listings:blacklist"
  | "listings:delete"
  | "reports:view"
  | "reports:resolve"
  | "ratings:delete"
  | "settings:edit"
  | "audit:view";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    "users:view", "users:edit", "users:suspend", "users:ban", "users:delete",
    "listings:view", "listings:moderate", "listings:blacklist", "listings:delete",
    "reports:view", "reports:resolve",
    "ratings:delete",
    "settings:edit",
    "audit:view",
  ],
  moderator: [
    "users:view", "users:edit", "users:suspend",
    "listings:view", "listings:moderate", "listings:blacklist",
    "reports:view", "reports:resolve",
    "audit:view",
  ],
  support: [
    "users:view", "users:edit",
    "listings:view",
    "reports:view", "reports:resolve",
    "audit:view",
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

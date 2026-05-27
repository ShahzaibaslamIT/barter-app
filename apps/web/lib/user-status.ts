import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface UserStatusFields {
  user_id: number;
  status: string;
  suspended_until: Date | null;
  suspension_reason: string | null;
  warning_count: number;
  blacklisted_until: Date | null;
  blacklist_reason: string | null;
}

/**
 * Check user status and auto-transition expired suspensions/blacklists.
 * Returns null if user is allowed to proceed, or a NextResponse error if blocked.
 */
export async function enforceUserStatus(
  userId: number
): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      status: true,
      suspended_until: true,
      suspension_reason: true,
      warning_count: true,
      blacklisted_until: true,
      blacklist_reason: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();

  // --- BANNED: permanent block ---
  if (user.status === "banned") {
    return NextResponse.json(
      {
        error: "Your account has been permanently banned due to repeated violations.",
        status_code: "BANNED",
      },
      { status: 403 }
    );
  }

  // --- SUSPENDED: check if expired ---
  if (user.status === "suspended") {
    if (user.suspended_until && user.suspended_until <= now) {
      // Suspension expired → move to "warned" status, increment warning count
      await prisma.user.update({
        where: { user_id: userId },
        data: {
          status: "warned",
          warning_count: { increment: 1 },
          suspended_until: null,
          suspension_reason: null,
        },
      });
      // User is now warned — allow through but they'll see a warning
      return null;
    }

    // Still suspended
    const remaining = user.suspended_until
      ? Math.ceil((user.suspended_until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json(
      {
        error: `Your account is suspended${user.suspension_reason ? `: ${user.suspension_reason}` : ""}. ${remaining > 0 ? `${remaining} day(s) remaining.` : "Contact support."}`,
        status_code: "SUSPENDED",
        suspended_until: user.suspended_until?.toISOString(),
        days_remaining: remaining,
      },
      { status: 403 }
    );
  }

  // --- BLACKLISTED: temporary block (10-15 days) ---
  if (user.status === "blacklisted") {
    if (user.blacklisted_until && user.blacklisted_until <= now) {
      // Blacklist expired → move to "warned"
      await prisma.user.update({
        where: { user_id: userId },
        data: {
          status: "warned",
          warning_count: { increment: 1 },
          blacklisted_until: null,
          blacklist_reason: null,
        },
      });
      return null;
    }

    // Still blacklisted
    const remaining = user.blacklisted_until
      ? Math.ceil((user.blacklisted_until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json(
      {
        error: `Your account is blacklisted${user.blacklist_reason ? `: ${user.blacklist_reason}` : ""}. ${remaining > 0 ? `${remaining} day(s) remaining.` : "Contact support."}`,
        status_code: "BLACKLISTED",
        blacklisted_until: user.blacklisted_until?.toISOString(),
        days_remaining: remaining,
      },
      { status: 403 }
    );
  }

  // --- WARNED: allowed but on thin ice ---
  // No block, just proceed. Admin panel shows warning_count for escalation decisions.

  // --- ACTIVE: all good ---
  return null;
}

/**
 * Quick check for login route — fetches user by email and enforces status.
 */
export async function enforceUserStatusByEmail(
  email: string
): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { user_id: true },
  });

  if (!user) return null; // Let the login route handle "user not found"
  return enforceUserStatus(user.user_id);
}

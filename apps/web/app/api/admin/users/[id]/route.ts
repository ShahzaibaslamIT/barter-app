export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, hasPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { user_id: Number(id) },
    include: {
      _count: {
        select: {
          listings: true,
          offersMade: true,
          reports_made: true,
          ratingsReceived: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = Number(id);
  const body = await req.json();
  const { action, username, user_type, admin_notes, suspension_reason, suspended_until, blacklist_reason, blacklist_days } = body;

  let updateData: Record<string, unknown> = {};
  let action_type = "edit_user";

  // Fetch current user state for escalation logic
  const currentUser = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { status: true, warning_count: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "suspend") {
    if (!hasPermission(admin.role, "users:suspend")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Default: 30 days suspension if no date provided
    const suspendUntil = suspended_until
      ? new Date(suspended_until)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    updateData = {
      status: "suspended",
      suspension_reason: suspension_reason || null,
      suspended_until: suspendUntil,
    };
    action_type = "suspend_user";
  } else if (action === "blacklist") {
    if (!hasPermission(admin.role, "users:suspend")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Blacklist: 10-15 days (default 15)
    const blacklistDays = body.blacklist_days || 15;
    const blacklistUntil = new Date(Date.now() + blacklistDays * 24 * 60 * 60 * 1000);
    updateData = {
      status: "blacklisted",
      blacklist_reason: suspension_reason || body.blacklist_reason || null,
      blacklisted_until: blacklistUntil,
    };
    action_type = "blacklist_user";
  } else if (action === "warn") {
    if (!hasPermission(admin.role, "users:suspend")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    updateData = {
      status: "warned",
      warning_count: { increment: 1 },
      suspension_reason: suspension_reason || null,
      suspended_until: null,
      blacklisted_until: null,
    };
    action_type = "warn_user";
  } else if (action === "ban") {
    if (!hasPermission(admin.role, "users:ban")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    updateData = {
      status: "banned",
      suspension_reason: suspension_reason || null,
      suspended_until: null,
      blacklisted_until: null,
    };
    action_type = "ban_user";
  } else if (action === "reactivate") {
    if (!hasPermission(admin.role, "users:suspend")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    updateData = {
      status: "active",
      suspension_reason: null,
      suspended_until: null,
      blacklist_reason: null,
      blacklisted_until: null,
    };
    action_type = "reactivate_user";
  } else {
    if (!hasPermission(admin.role, "users:edit")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (username !== undefined) updateData.username = username;
    if (user_type !== undefined) updateData.user_type = user_type;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
  }

  const updated = await prisma.user.update({
    where: { user_id: userId },
    data: updateData,
  });

  await createAuditLog({
    admin_id: admin.admin_id,
    action_type,
    entity_type: "user",
    entity_id: userId,
    metadata: { action, ...updateData },
  });

  return NextResponse.json({ user: updated });
}

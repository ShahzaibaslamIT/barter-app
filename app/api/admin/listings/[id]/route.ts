export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, hasPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { ModerationStatus } from "@prisma/client";

const ACTION_TO_STATUS: Record<string, ModerationStatus> = {
  approve: "approved",
  reject: "rejected",
  remove: "removed",
  needs_update: "needs_update",
  spam: "spam_flagged",
  blacklist: "blacklisted",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { item_id: Number(id) },
    include: {
      user: { select: { user_id: true, username: true, email: true } },
    },
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listingId = Number(id);
  const { action, reason } = await req.json();

  // Blacklist requires its own permission
  if (action === "blacklist") {
    if (!hasPermission(admin.role, "listings:blacklist")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    if (!hasPermission(admin.role, "listings:moderate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const newStatus = ACTION_TO_STATUS[action];
  if (!newStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { item_id: listingId },
    data: {
      moderation_status: newStatus,
      moderation_reason: reason || null,
      moderated_by_id: admin.admin_id,
      moderated_at: new Date(),
      // Deactivate on reject/remove/blacklist so listing disappears from app
      ...(["rejected", "removed", "blacklisted"].includes(newStatus) ? { is_active: false } : {}),
      // Re-activate on approve
      ...(newStatus === "approved" ? { is_active: true } : {}),
    },
  });

  await createAuditLog({
    admin_id: admin.admin_id,
    action_type: `listing_${action}`,
    entity_type: "listing",
    entity_id: listingId,
    metadata: { action, reason, new_status: newStatus },
  });

  return NextResponse.json({ listing: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(admin.role, "listings:delete")) {
    return NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 });
  }

  const { id } = await params;
  const listingId = Number(id);

  const existing = await prisma.listing.findUnique({ where: { item_id: listingId }, select: { item_id: true, title: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.listing.delete({ where: { item_id: listingId } });

  await createAuditLog({
    admin_id: admin.admin_id,
    action_type: "listing_hard_delete",
    entity_type: "listing",
    entity_id: listingId,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ success: true });
}

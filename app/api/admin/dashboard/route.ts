export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);

  const [
    newUsers24h, newUsers7d, totalUsers,
    activeListings, pendingListings, totalListings,
    offersToday, totalOffers,
    openReports,
  ] = await Promise.all([
    prisma.user.count({ where: { created_at: { gte: yesterday } } }),
    prisma.user.count({ where: { created_at: { gte: last7d } } }),
    prisma.user.count(),
    prisma.listing.count({ where: { is_active: true, moderation_status: "approved" } }),
    prisma.listing.count({ where: { moderation_status: "pending" } }),
    prisma.listing.count(),
    prisma.barterOffer.count({ where: { created_at: { gte: todayStart } } }),
    prisma.barterOffer.count(),
    prisma.report.count({ where: { status: "open" } }),
  ]);

  return NextResponse.json({
    users: { new_24h: newUsers24h, new_7d: newUsers7d, total: totalUsers },
    listings: { active: activeListings, pending_review: pendingListings, total: totalListings },
    offers: { today: offersToday, total: totalOffers },
    reports: { open: openReports },
  });
}

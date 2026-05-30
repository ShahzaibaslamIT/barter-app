export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@barter/db";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const user_type = searchParams.get("type") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (user_type) where.user_type = user_type;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        user_id: true,
        username: true,
        email: true,
        user_type: true,
        status: true,
        city: true,
        country: true,
        created_at: true,
        email_verified: true,
        admin_notes: true,
        suspended_until: true,
        _count: {
          select: { listings: true, offersMade: true, reports_made: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

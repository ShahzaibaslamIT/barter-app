export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@barter/db";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.reported_type = type;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { user_id: true, username: true, email: true } },
        resolved_by: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({ reports, total, page, pages: Math.ceil(total / limit) });
}

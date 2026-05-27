export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, hasPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(admin.role, "reports:resolve")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const reportId = Number(id);
  const { status, outcome, notes } = await req.json();

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: status || "resolved",
      outcome: outcome || null,
      notes: notes || null,
      resolved_by_id: admin.admin_id,
      resolved_at: new Date(),
    },
  });

  await createAuditLog({
    admin_id: admin.admin_id,
    action_type: "resolve_report",
    entity_type: "report",
    entity_id: reportId,
    metadata: { status, outcome, notes },
  });

  return NextResponse.json({ report: updated });
}

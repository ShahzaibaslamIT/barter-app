import { prisma } from "@/lib/prisma";

interface AuditParams {
  admin_id: number;
  action_type: string;
  entity_type: string;
  entity_id: number;
  metadata?: Record<string, unknown>;
  notes?: string;
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      admin_id: params.admin_id,
      action_type: params.action_type,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      metadata: params.metadata ?? {},
      notes: params.notes,
    },
  });
}

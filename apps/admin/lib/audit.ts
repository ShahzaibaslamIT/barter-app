import { prisma } from "@barter/db";

interface AuditParams {
  admin_id: number;
  action_type: string;
  entity_type: string;
  entity_id: number;
  metadata?: Record<string, unknown>;
  notes?: string;
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  // Audit logging is secondary: a logging failure must never break the primary
  // admin action (suspend/ban/etc). Also coerce metadata to a JSON-safe shape —
  // callers spread `updateData` in here, which can contain JS Date objects
  // (e.g. suspended_until); Prisma rejects a Date inside a Json column.
  try {
    const metadata = params.metadata
      ? JSON.parse(JSON.stringify(params.metadata))
      : {};
    await prisma.auditLog.create({
      data: {
        admin_id: params.admin_id,
        action_type: params.action_type,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        metadata,
        notes: params.notes,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}

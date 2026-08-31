import type { AuditActorType, PrismaClient } from "@prisma/client";

export const AUDIT_ACTIONS = {
  CART_CREATED: "CART_CREATED",
  CART_ITEM_ADDED: "CART_ITEM_ADDED",
  CART_ITEM_UPDATED: "CART_ITEM_UPDATED",
  CART_ITEM_REMOVED: "CART_ITEM_REMOVED",
  CART_CLEARED: "CART_CLEARED",
  CHECKOUT_VALIDATED: "CHECKOUT_VALIDATED",
  CHECKOUT_REJECTED: "CHECKOUT_REJECTED",
  CHECKOUT_APPROVED: "CHECKOUT_APPROVED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type RecordAuditEventInput = {
  merchantId: string;
  actorType: AuditActorType;
  action: AuditAction;
  entityType: string;
  entityId: string;
  reason?: string;
  metadata?: Record<string, unknown>;
};

export async function recordAuditEvent(prisma: PrismaClient, input: RecordAuditEventInput) {
  return prisma.auditEvent.create({
    data: {
      merchantId: input.merchantId,
      actorType: input.actorType,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      reason: input.reason,
      metadata: input.metadata,
    },
  });
}

import type { AuditActorType, Prisma, PrismaClient } from "@prisma/client";

export const AUDIT_ACTIONS = {
  AGENT_SESSION_STARTED: "AGENT_SESSION_STARTED",
  PRODUCT_SEARCHED: "PRODUCT_SEARCHED",
  PRODUCT_RECOMMENDED: "PRODUCT_RECOMMENDED",
  CART_CREATED: "CART_CREATED",
  CART_ITEM_ADDED: "CART_ITEM_ADDED",
  CART_ITEM_UPDATED: "CART_ITEM_UPDATED",
  CART_ITEM_REMOVED: "CART_ITEM_REMOVED",
  CART_CLEARED: "CART_CLEARED",
  CHECKOUT_VALIDATED: "CHECKOUT_VALIDATED",
  CHECKOUT_REJECTED: "CHECKOUT_REJECTED",
  CHECKOUT_APPROVAL_REQUESTED: "CHECKOUT_APPROVAL_REQUESTED",
  CHECKOUT_APPROVED: "CHECKOUT_APPROVED",
  CHECKOUT_APPROVAL_INVALIDATED: "CHECKOUT_APPROVAL_INVALIDATED",
  PAYMENT_STARTED: "PAYMENT_STARTED",
  PAYMENT_SUCCEEDED: "PAYMENT_SUCCEEDED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type RecordAuditEventInput = {
  merchantId: string;
  actorType: AuditActorType;
  action: AuditAction;
  entityType: string;
  entityId: string;
  reason?: string;
  metadata?: Prisma.InputJsonObject;
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

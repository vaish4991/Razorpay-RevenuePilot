import type { AuditActorType, PrismaClient } from "@prisma/client";

import { recordAuditEvent, AUDIT_ACTIONS } from "@/services/audit-service";
import { recalculateCart } from "@/services/cart-service";
import { ServiceError } from "@/services/errors";

export type CheckoutValidationResult = {
  valid: boolean;
  errors: string[];
  cartSnapshot: {
    cartId: string;
    merchantId: string;
    customerId: string | null;
    itemCount: number;
    currency: string;
    subtotalInPaise: number;
    totalInPaise: number;
    updatedAt: string;
  } | null;
  totalInPaise: number;
};

export async function validateCheckout(
  prisma: PrismaClient,
  input: {
    merchantId: string;
    cartId: string;
    customerId?: string | null;
    actorType?: AuditActorType;
  },
): Promise<CheckoutValidationResult> {
  const errors: string[] = [];

  const cart = await prisma.cart.findFirst({
    where: {
      id: input.cartId,
      merchantId: input.merchantId,
    },
  });

  if (!cart) {
    errors.push("Cart not found");
    return {
      valid: false,
      errors,
      cartSnapshot: null,
      totalInPaise: 0,
    };
  }

  if (cart.status !== "ACTIVE") {
    errors.push("Cart is not active");
  }

  if (input.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, merchantId: input.merchantId },
      select: { id: true },
    });
    if (!customer) {
      errors.push("Customer not found for merchant");
    }
  }

  const recalculated = await recalculateCart(prisma, input.merchantId, input.cartId);

  if (recalculated.items.length === 0) {
    errors.push("Cart is empty");
  }

  const productIds = recalculated.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      merchantId: input.merchantId,
      id: { in: productIds },
    },
    select: {
      id: true,
      active: true,
      inventoryQuantity: true,
      currency: true,
      priceInPaise: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of recalculated.items) {
    const product = productMap.get(item.productId);

    if (!product) {
      errors.push(`Product ${item.productId} no longer exists`);
      continue;
    }

    if (!product.active) {
      errors.push(`Product ${item.productId} is inactive`);
    }

    if (item.quantity > product.inventoryQuantity) {
      errors.push(`Insufficient inventory for product ${item.productId}`);
    }

    if (item.unitPriceInPaise !== product.priceInPaise) {
      errors.push(`Stale pricing detected for product ${item.productId}`);
    }

    if (product.currency !== recalculated.currency) {
      errors.push(`Currency mismatch for product ${item.productId}`);
    }
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: input.merchantId },
    select: { currency: true },
  });

  if (!merchant) {
    errors.push("Merchant not found");
  } else if (merchant.currency !== recalculated.currency) {
    errors.push("Cart currency mismatch with merchant currency");
  }

  const valid = errors.length === 0;

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "SYSTEM",
    action: valid ? AUDIT_ACTIONS.CHECKOUT_VALIDATED : AUDIT_ACTIONS.CHECKOUT_REJECTED,
    entityType: "CART",
    entityId: input.cartId,
    reason: valid ? undefined : errors.join("; "),
    metadata: {
      errors,
      totalInPaise: recalculated.totalInPaise,
      itemCount: recalculated.itemCount,
    },
  });

  return {
    valid,
    errors,
    cartSnapshot: {
      cartId: recalculated.id,
      merchantId: recalculated.merchantId,
      customerId: recalculated.customerId,
      itemCount: recalculated.itemCount,
      currency: recalculated.currency,
      subtotalInPaise: recalculated.subtotalInPaise,
      totalInPaise: recalculated.totalInPaise,
      updatedAt: recalculated.updatedAt.toISOString(),
    },
    totalInPaise: recalculated.totalInPaise,
  };
}

export async function approveCheckout(
  prisma: PrismaClient,
  input: {
    merchantId: string;
    cartId: string;
    customerId?: string | null;
    actorType?: AuditActorType;
    reason?: string;
  },
) {
  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "CUSTOMER",
    action: AUDIT_ACTIONS.CHECKOUT_APPROVAL_REQUESTED,
    entityType: "CART",
    entityId: input.cartId,
    reason: input.reason,
  });

  const validation = await validateCheckout(prisma, {
    merchantId: input.merchantId,
    cartId: input.cartId,
    customerId: input.customerId,
    actorType: input.actorType,
  });

  if (!validation.valid || !validation.cartSnapshot) {
    throw new ServiceError("PRECONDITION_FAILED", "Cart is not eligible for checkout approval", {
      errors: validation.errors,
    });
  }

  const existingApproved = await prisma.checkoutApproval.findFirst({
    where: {
      merchantId: input.merchantId,
      cartId: input.cartId,
      status: "APPROVED",
    },
    select: { id: true },
  });

  if (existingApproved) {
    await prisma.checkoutApproval.update({
      where: { id: existingApproved.id },
      data: {
        status: "INVALIDATED",
        invalidatedAt: new Date(),
        invalidationReason: "Superseded by a new approval",
      },
    });

    await recordAuditEvent(prisma, {
      merchantId: input.merchantId,
      actorType: input.actorType ?? "CUSTOMER",
      action: AUDIT_ACTIONS.CHECKOUT_APPROVAL_INVALIDATED,
      entityType: "CHECKOUT_APPROVAL",
      entityId: existingApproved.id,
      reason: "Superseded by a new approval",
      metadata: {
        cartId: input.cartId,
      },
    });
  }

  const approval = await prisma.checkoutApproval.create({
    data: {
      merchantId: input.merchantId,
      cartId: input.cartId,
      customerId: input.customerId ?? validation.cartSnapshot.customerId ?? null,
      status: "APPROVED",
      approvedTotalInPaise: validation.totalInPaise,
      currency: validation.cartSnapshot.currency,
      cartUpdatedAtSnapshot: new Date(validation.cartSnapshot.updatedAt),
    },
  });

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "CUSTOMER",
    action: AUDIT_ACTIONS.CHECKOUT_APPROVED,
    entityType: "CHECKOUT_APPROVAL",
    entityId: approval.id,
    reason: input.reason,
    metadata: {
      cartId: input.cartId,
      totalInPaise: approval.approvedTotalInPaise,
      currency: approval.currency,
    },
  });

  return approval;
}

export async function verifyCheckoutApprovalForCart(
  prisma: PrismaClient,
  input: {
    merchantId: string;
    cartId: string;
    approvalId: string;
    expectedTotalInPaise: number;
    expectedCurrency: string;
  },
) {
  const approval = await prisma.checkoutApproval.findFirst({
    where: {
      id: input.approvalId,
      merchantId: input.merchantId,
      cartId: input.cartId,
    },
  });

  if (!approval) {
    return { valid: false, reason: "Approval not found for merchant/cart" };
  }

  if (approval.status !== "APPROVED") {
    return { valid: false, reason: "Approval is not active" };
  }

  const cart = await prisma.cart.findFirst({
    where: { id: input.cartId, merchantId: input.merchantId },
    select: { updatedAt: true, totalInPaise: true, currency: true },
  });

  if (!cart) {
    return { valid: false, reason: "Cart not found" };
  }

  if (cart.updatedAt.getTime() !== approval.cartUpdatedAtSnapshot.getTime()) {
    return { valid: false, reason: "Cart changed after approval" };
  }

  if (approval.approvedTotalInPaise !== input.expectedTotalInPaise) {
    return { valid: false, reason: "Approval amount mismatch" };
  }

  if (approval.currency !== input.expectedCurrency || cart.currency !== input.expectedCurrency) {
    return { valid: false, reason: "Approval currency mismatch" };
  }

  return { valid: true as const, reason: "Approval is valid" };
}

import type { AuditActorType, CartStatus, Prisma, PrismaClient } from "@prisma/client";

import { recordAuditEvent, AUDIT_ACTIONS } from "@/services/audit-service";
import { ServiceError } from "@/services/errors";
import { calculateTotalInPaise } from "@/validation/commerce";

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            merchantId: true;
            active: true;
            currency: true;
            priceInPaise: true;
            inventoryQuantity: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type CartSummary = {
  id: string;
  merchantId: string;
  customerId: string | null;
  status: CartStatus;
  currency: string;
  subtotalInPaise: number;
  totalInPaise: number;
  itemCount: number;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPriceInPaise: number;
    totalPriceInPaise: number;
  }>;
  updatedAt: Date;
};

export async function createCart(
  prisma: PrismaClient,
  input: { merchantId: string; customerId?: string | null; actorType?: AuditActorType },
) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: input.merchantId },
    select: { id: true, currency: true },
  });

  if (!merchant) {
    throw new ServiceError("NOT_FOUND", "Merchant not found");
  }

  if (input.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, merchantId: input.merchantId },
      select: { id: true },
    });
    if (!customer) {
      throw new ServiceError("NOT_FOUND", "Customer not found for merchant");
    }
  }

  const cart = await prisma.cart.create({
    data: {
      merchantId: input.merchantId,
      customerId: input.customerId ?? null,
      status: "ACTIVE",
      currency: merchant.currency,
      subtotalInPaise: 0,
      totalInPaise: 0,
    },
  });

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "SYSTEM",
    action: AUDIT_ACTIONS.CART_CREATED,
    entityType: "CART",
    entityId: cart.id,
    metadata: {
      customerId: cart.customerId,
      currency: cart.currency,
    },
  });

  return cart;
}

async function getCartWithItems(prisma: PrismaClient, merchantId: string, cartId: string): Promise<CartWithItems> {
  const cart = await prisma.cart.findFirst({
    where: {
      id: cartId,
      merchantId,
    },
    include: {
      items: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        include: {
          product: {
            select: {
              id: true,
              merchantId: true,
              active: true,
              currency: true,
              priceInPaise: true,
              inventoryQuantity: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    throw new ServiceError("NOT_FOUND", "Cart not found");
  }

  return cart;
}

async function invalidateApprovalsForCart(
  prisma: PrismaClient,
  merchantId: string,
  cartId: string,
  reason: string,
  actorType: AuditActorType = "SYSTEM",
) {
  const activeApprovals = await prisma.checkoutApproval.findMany({
    where: {
      merchantId,
      cartId,
      status: "APPROVED",
    },
    select: { id: true },
  });

  if (activeApprovals.length === 0) {
    return;
  }

  const invalidatedAt = new Date();

  await prisma.checkoutApproval.updateMany({
    where: {
      id: { in: activeApprovals.map((approval) => approval.id) },
    },
    data: {
      status: "INVALIDATED",
      invalidatedAt,
      invalidationReason: reason,
    },
  });

  for (const approval of activeApprovals) {
    await recordAuditEvent(prisma, {
      merchantId,
      actorType,
      action: AUDIT_ACTIONS.CHECKOUT_APPROVAL_INVALIDATED,
      entityType: "CHECKOUT_APPROVAL",
      entityId: approval.id,
      reason,
      metadata: {
        cartId,
      },
    });
  }
}

export async function recalculateCart(prisma: PrismaClient, merchantId: string, cartId: string) {
  const cart = await getCartWithItems(prisma, merchantId, cartId);

  let hasChanges = false;
  const itemMutations: Promise<unknown>[] = [];

  for (const item of cart.items) {
    const authoritativeUnitPrice = item.product.priceInPaise;
    const authoritativeTotal = authoritativeUnitPrice * item.quantity;

    if (
      item.unitPriceInPaise !== authoritativeUnitPrice ||
      item.totalPriceInPaise !== authoritativeTotal
    ) {
      hasChanges = true;
      itemMutations.push(
        prisma.cartItem.update({
          where: { id: item.id },
          data: {
            unitPriceInPaise: authoritativeUnitPrice,
            totalPriceInPaise: authoritativeTotal,
          },
        }),
      );
    }
  }

  if (itemMutations.length > 0) {
    await Promise.all(itemMutations);
  }

  const refreshedItems = cart.items.map((item) => ({
    ...item,
    unitPriceInPaise: item.product.priceInPaise,
    totalPriceInPaise: item.product.priceInPaise * item.quantity,
  }));

  const subtotalInPaise = calculateTotalInPaise(
    refreshedItems.map((item) => ({
      unitPriceInPaise: item.unitPriceInPaise,
      quantity: item.quantity,
    })),
  );

  if (hasChanges || cart.subtotalInPaise !== subtotalInPaise || cart.totalInPaise !== subtotalInPaise) {
    hasChanges = true;
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotalInPaise,
        totalInPaise: subtotalInPaise,
      },
    });
  }

  if (hasChanges) {
    await invalidateApprovalsForCart(prisma, merchantId, cartId, "Cart changed after approval", "SYSTEM");
  }

  const finalCart = await getCartWithItems(prisma, merchantId, cartId);
  return toCartSummary(finalCart);
}

export async function getCart(prisma: PrismaClient, merchantId: string, cartId: string) {
  return recalculateCart(prisma, merchantId, cartId);
}

export async function addCartItem(
  prisma: PrismaClient,
  input: {
    merchantId: string;
    cartId: string;
    productId: string;
    quantity: number;
    actorType?: AuditActorType;
  },
) {
  const cart = await getCartWithItems(prisma, input.merchantId, input.cartId);
  if (cart.status !== "ACTIVE") {
    throw new ServiceError("PRECONDITION_FAILED", "Cart is not active");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      merchantId: input.merchantId,
    },
    select: {
      id: true,
      active: true,
      inventoryQuantity: true,
      priceInPaise: true,
      currency: true,
      name: true,
    },
  });

  if (!product) {
    throw new ServiceError("NOT_FOUND", "Product not found for merchant");
  }
  if (!product.active) {
    throw new ServiceError("PRECONDITION_FAILED", "Product is inactive");
  }
  if (input.quantity > product.inventoryQuantity) {
    throw new ServiceError("PRECONDITION_FAILED", "Insufficient inventory");
  }
  if (product.currency !== cart.currency) {
    throw new ServiceError("PRECONDITION_FAILED", "Product currency does not match cart currency");
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: input.cartId,
      productId: input.productId,
    },
    select: { id: true, quantity: true },
  });

  let finalQuantity = input.quantity;

  if (existingItem) {
    finalQuantity = existingItem.quantity + input.quantity;
    if (finalQuantity > product.inventoryQuantity) {
      throw new ServiceError("PRECONDITION_FAILED", "Insufficient inventory");
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: finalQuantity,
        unitPriceInPaise: product.priceInPaise,
        totalPriceInPaise: product.priceInPaise * finalQuantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: input.cartId,
        productId: input.productId,
        quantity: input.quantity,
        unitPriceInPaise: product.priceInPaise,
        totalPriceInPaise: product.priceInPaise * input.quantity,
      },
    });
  }

  await invalidateApprovalsForCart(prisma, input.merchantId, input.cartId, "Cart item added or updated");

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "SYSTEM",
    action: AUDIT_ACTIONS.CART_ITEM_ADDED,
    entityType: "CART",
    entityId: input.cartId,
    metadata: {
      productId: product.id,
      quantity: finalQuantity,
      unitPriceInPaise: product.priceInPaise,
    },
  });

  return recalculateCart(prisma, input.merchantId, input.cartId);
}

export async function updateCartItemQuantity(
  prisma: PrismaClient,
  input: {
    merchantId: string;
    cartId: string;
    itemId: string;
    quantity: number;
    actorType?: AuditActorType;
  },
) {
  const cart = await getCartWithItems(prisma, input.merchantId, input.cartId);
  if (cart.status !== "ACTIVE") {
    throw new ServiceError("PRECONDITION_FAILED", "Cart is not active");
  }

  const item = cart.items.find((cartItem) => cartItem.id === input.itemId);
  if (!item) {
    throw new ServiceError("NOT_FOUND", "Cart item not found");
  }

  if (!item.product.active) {
    throw new ServiceError("PRECONDITION_FAILED", "Product is inactive");
  }

  if (input.quantity > item.product.inventoryQuantity) {
    throw new ServiceError("PRECONDITION_FAILED", "Insufficient inventory");
  }

  await prisma.cartItem.update({
    where: { id: input.itemId },
    data: {
      quantity: input.quantity,
      unitPriceInPaise: item.product.priceInPaise,
      totalPriceInPaise: item.product.priceInPaise * input.quantity,
    },
  });

  await invalidateApprovalsForCart(prisma, input.merchantId, input.cartId, "Cart item quantity updated");

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "SYSTEM",
    action: AUDIT_ACTIONS.CART_ITEM_UPDATED,
    entityType: "CART",
    entityId: input.cartId,
    metadata: {
      itemId: input.itemId,
      quantity: input.quantity,
    },
  });

  return recalculateCart(prisma, input.merchantId, input.cartId);
}

export async function removeCartItem(
  prisma: PrismaClient,
  input: {
    merchantId: string;
    cartId: string;
    itemId: string;
    actorType?: AuditActorType;
  },
) {
  const cart = await getCartWithItems(prisma, input.merchantId, input.cartId);
  const item = cart.items.find((cartItem) => cartItem.id === input.itemId);
  if (!item) {
    throw new ServiceError("NOT_FOUND", "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: { id: input.itemId },
  });

  await invalidateApprovalsForCart(prisma, input.merchantId, input.cartId, "Cart item removed");

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "SYSTEM",
    action: AUDIT_ACTIONS.CART_ITEM_REMOVED,
    entityType: "CART",
    entityId: input.cartId,
    metadata: {
      itemId: input.itemId,
      productId: item.productId,
    },
  });

  return recalculateCart(prisma, input.merchantId, input.cartId);
}

export async function clearCart(
  prisma: PrismaClient,
  input: { merchantId: string; cartId: string; actorType?: AuditActorType },
) {
  await getCartWithItems(prisma, input.merchantId, input.cartId);

  await prisma.cartItem.deleteMany({
    where: { cartId: input.cartId },
  });

  await prisma.cart.update({
    where: { id: input.cartId },
    data: {
      subtotalInPaise: 0,
      totalInPaise: 0,
    },
  });

  await invalidateApprovalsForCart(prisma, input.merchantId, input.cartId, "Cart cleared");

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "SYSTEM",
    action: AUDIT_ACTIONS.CART_CLEARED,
    entityType: "CART",
    entityId: input.cartId,
  });

  return recalculateCart(prisma, input.merchantId, input.cartId);
}

function toCartSummary(cart: CartWithItems): CartSummary {
  return {
    id: cart.id,
    merchantId: cart.merchantId,
    customerId: cart.customerId,
    status: cart.status,
    currency: cart.currency,
    subtotalInPaise: cart.subtotalInPaise,
    totalInPaise: cart.totalInPaise,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    updatedAt: cart.updatedAt,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPriceInPaise: item.unitPriceInPaise,
      totalPriceInPaise: item.totalPriceInPaise,
    })),
  };
}

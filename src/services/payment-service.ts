import type { AuditActorType, OrderStatus, PrismaClient } from "@prisma/client";

import { recordAuditEvent, AUDIT_ACTIONS } from "@/services/audit-service";
import { getCart } from "@/services/cart-service";
import { verifyCheckoutApprovalForCart } from "@/services/checkout-service";
import { ServiceError } from "@/services/errors";

export type PaymentExecutionResult = {
  provider: "demo" | "razorpay_test";
  modeLabel: string;
  orderId: string;
  status: OrderStatus;
  amountInPaise: number;
  currency: string;
  razorpayOrderId?: string;
  message: string;
};

type ExecutePaymentInput = {
  merchantId: string;
  cartId: string;
  approvalId: string;
  customerId?: string | null;
  actorType?: AuditActorType;
};

type Provider = {
  name: "demo" | "razorpay_test";
  execute: (prisma: PrismaClient, input: ExecutePaymentInput) => Promise<PaymentExecutionResult>;
};

async function ensurePaymentReady(prisma: PrismaClient, input: ExecutePaymentInput) {
  const cart = await getCart(prisma, input.merchantId, input.cartId);

  if (cart.items.length === 0) {
    throw new ServiceError("PRECONDITION_FAILED", "Cannot execute payment for empty cart");
  }

  const approval = await verifyCheckoutApprovalForCart(prisma, {
    merchantId: input.merchantId,
    cartId: input.cartId,
    approvalId: input.approvalId,
    expectedTotalInPaise: cart.totalInPaise,
    expectedCurrency: cart.currency,
  });

  if (!approval.valid) {
    throw new ServiceError("PRECONDITION_FAILED", `Payment blocked: ${approval.reason}`);
  }

  return cart;
}

async function createOrderFromCart(
  prisma: PrismaClient,
  input: ExecutePaymentInput,
  status: OrderStatus,
  razorpayOrderId?: string,
) {
  const cart = await getCart(prisma, input.merchantId, input.cartId);

  const order = await prisma.order.create({
    data: {
      merchantId: input.merchantId,
      customerId: input.customerId ?? cart.customerId,
      status,
      currency: cart.currency,
      subtotalInPaise: cart.subtotalInPaise,
      totalInPaise: cart.totalInPaise,
      razorpayOrderId: razorpayOrderId ?? null,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceInPaise: item.unitPriceInPaise,
          totalPriceInPaise: item.totalPriceInPaise,
        })),
      },
    },
  });

  await prisma.checkoutApproval.update({
    where: { id: input.approvalId },
    data: {
      status: "CONSUMED",
    },
  });

  return { order, cart };
}

const demoProvider: Provider = {
  name: "demo",
  async execute(prisma, input) {
    const cart = await ensurePaymentReady(prisma, input);

    const { order } = await createOrderFromCart(prisma, input, "PAID");

    return {
      provider: "demo",
      modeLabel: "Demo Payment — No real money is charged.",
      orderId: order.id,
      status: order.status,
      amountInPaise: cart.totalInPaise,
      currency: cart.currency,
      message: "Demo payment completed successfully.",
    };
  },
};

const razorpayProvider: Provider = {
  name: "razorpay_test",
  async execute(prisma, input) {
    const cart = await ensurePaymentReady(prisma, input);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("replace") || keySecret.includes("replace")) {
      throw new ServiceError("PRECONDITION_FAILED", "Razorpay test credentials are not configured");
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: cart.totalInPaise,
        currency: cart.currency,
        receipt: `cart_${input.cartId}`,
      }),
    });

    if (!razorpayResponse.ok) {
      throw new ServiceError("PRECONDITION_FAILED", "Razorpay order creation failed in test mode");
    }

    const payload = (await razorpayResponse.json()) as { id?: string };

    if (!payload.id) {
      throw new ServiceError("PRECONDITION_FAILED", "Invalid Razorpay response while creating order");
    }

    const { order } = await createOrderFromCart(prisma, input, "PAYMENT_PENDING", payload.id);

    return {
      provider: "razorpay_test",
      modeLabel: "Razorpay Test Mode — external payment authorization pending.",
      orderId: order.id,
      status: order.status,
      amountInPaise: cart.totalInPaise,
      currency: cart.currency,
      razorpayOrderId: payload.id,
      message: "Razorpay test order created successfully.",
    };
  },
};

function selectProvider(): Provider {
  if (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_ID.includes("replace") &&
    !process.env.RAZORPAY_KEY_SECRET.includes("replace")
  ) {
    return razorpayProvider;
  }

  return demoProvider;
}

export async function executePayment(prisma: PrismaClient, input: ExecutePaymentInput): Promise<PaymentExecutionResult> {
  const provider = selectProvider();

  await recordAuditEvent(prisma, {
    merchantId: input.merchantId,
    actorType: input.actorType ?? "CUSTOMER",
    action: AUDIT_ACTIONS.PAYMENT_STARTED,
    entityType: "CART",
    entityId: input.cartId,
    metadata: {
      provider: provider.name,
      approvalId: input.approvalId,
    },
  });

  try {
    const result = await provider.execute(prisma, input);

    await recordAuditEvent(prisma, {
      merchantId: input.merchantId,
      actorType: input.actorType ?? "CUSTOMER",
      action: AUDIT_ACTIONS.PAYMENT_SUCCEEDED,
      entityType: "ORDER",
      entityId: result.orderId,
      metadata: {
        provider: result.provider,
        amountInPaise: result.amountInPaise,
        currency: result.currency,
        razorpayOrderId: result.razorpayOrderId,
      },
    });

    return result;
  } catch (error) {
    await recordAuditEvent(prisma, {
      merchantId: input.merchantId,
      actorType: input.actorType ?? "CUSTOMER",
      action: AUDIT_ACTIONS.PAYMENT_FAILED,
      entityType: "CART",
      entityId: input.cartId,
      reason: error instanceof Error ? error.message : "Unknown payment error",
      metadata: {
        provider: provider.name,
        approvalId: input.approvalId,
      },
    });

    throw error;
  }
}

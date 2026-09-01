import { NextResponse } from "next/server";

import { runShoppingAgent } from "@/agent";
import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { prisma } from "@/database";
import { getDemoMerchant, resolveDemoCustomerId } from "@/lib/demo-context";
import { recordAuditEvent, AUDIT_ACTIONS } from "@/services/audit-service";
import { createCart, getCart, addCartItem, updateCartItemQuantity, removeCartItem, clearCart } from "@/services/cart-service";
import { searchProducts, getProduct } from "@/services/catalog-service";
import { approveCheckout, validateCheckout } from "@/services/checkout-service";
import { parseAgentChatInput } from "@/validation/agent";

export async function POST(request: Request) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const body = parseAgentChatInput(await request.json());
    const customerId = await resolveDemoCustomerId(
      prisma,
      merchant.id,
      body.customerExternalReference ?? "cust_demo_001",
    );

    await recordAuditEvent(prisma, {
      merchantId: merchant.id,
      actorType: "AGENT",
      action: AUDIT_ACTIONS.AGENT_SESSION_STARTED,
      entityType: "MERCHANT",
      entityId: merchant.id,
      metadata: {
        message: body.message,
      },
    });

    const tools = {
      searchProducts: async (input: Parameters<typeof searchProducts>[2]) => {
        const result = await searchProducts(prisma, merchant.id, input);
        await recordAuditEvent(prisma, {
          merchantId: merchant.id,
          actorType: "AGENT",
          action: AUDIT_ACTIONS.PRODUCT_SEARCHED,
          entityType: "MERCHANT",
          entityId: merchant.id,
          metadata: {
            query: input.query,
            category: input.category,
            maxPriceInPaise: input.maxPriceInPaise,
            resultCount: result.totalCount,
          },
        });

        return {
          products: result.products,
          totalCount: result.totalCount,
        };
      },
      getProduct: (productId: string) => getProduct(prisma, merchant.id, productId),
      createCart: async (toolCustomerId?: string | null) => {
        const cart = await createCart(prisma, {
          merchantId: merchant.id,
          customerId: toolCustomerId ?? customerId,
          actorType: "AGENT",
        });
        return { id: cart.id };
      },
      getCart: (cartId: string) => getCart(prisma, merchant.id, cartId),
      addToCart: (cartId: string, productId: string, quantity: number) =>
        addCartItem(prisma, {
          merchantId: merchant.id,
          cartId,
          productId,
          quantity,
          actorType: "AGENT",
        }),
      updateCartItem: (cartId: string, itemId: string, quantity: number) =>
        updateCartItemQuantity(prisma, {
          merchantId: merchant.id,
          cartId,
          itemId,
          quantity,
          actorType: "AGENT",
        }),
      removeFromCart: (cartId: string, itemId: string) =>
        removeCartItem(prisma, {
          merchantId: merchant.id,
          cartId,
          itemId,
          actorType: "AGENT",
        }),
      clearCart: (cartId: string) =>
        clearCart(prisma, {
          merchantId: merchant.id,
          cartId,
          actorType: "AGENT",
        }),
      validateCheckout: async (cartId: string, toolCustomerId?: string | null) => {
        const result = await validateCheckout(prisma, {
          merchantId: merchant.id,
          cartId,
          customerId: toolCustomerId ?? customerId,
          actorType: "AGENT",
        });
        return {
          valid: result.valid,
          errors: result.errors,
        };
      },
      requestCheckoutApproval: async (cartId: string, toolCustomerId?: string | null) => {
        const approval = await approveCheckout(prisma, {
          merchantId: merchant.id,
          cartId,
          customerId: toolCustomerId ?? customerId,
          actorType: "CUSTOMER",
        });
        return { id: approval.id };
      },
    };

    const result = await runShoppingAgent(body.message, tools);

    for (const recommendation of result.recommendations.slice(0, 3)) {
      await recordAuditEvent(prisma, {
        merchantId: merchant.id,
        actorType: "AGENT",
        action: AUDIT_ACTIONS.PRODUCT_RECOMMENDED,
        entityType: "PRODUCT",
        entityId: recommendation.productId,
        metadata: {
          score: recommendation.score,
          reason: recommendation.reason,
        },
      });
    }

    return NextResponse.json(
      {
        ...result,
        cartId: body.cartId,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

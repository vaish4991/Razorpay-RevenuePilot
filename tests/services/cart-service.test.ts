import { describe, expect, it, vi } from "vitest";

import { addCartItem } from "../../src/services/cart-service";

describe("cart service", () => {
  it("uses authoritative product price instead of client price", async () => {
    const cartItemCreate = vi.fn().mockResolvedValue(undefined);
    const cartItemFindFirst = vi.fn().mockResolvedValue(null);

    const prisma = {
      cart: {
        findFirst: vi.fn().mockResolvedValue({
          id: "c1",
          merchantId: "m1",
          customerId: null,
          status: "ACTIVE",
          currency: "INR",
          subtotalInPaise: 0,
          totalInPaise: 0,
          items: [],
          updatedAt: new Date(),
        }),
        update: vi.fn().mockResolvedValue(undefined),
      },
      cartItem: {
        create: cartItemCreate,
        findFirst: cartItemFindFirst,
        update: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        deleteMany: vi.fn().mockResolvedValue(undefined),
      },
      product: {
        findFirst: vi.fn().mockResolvedValue({
          id: "p1",
          active: true,
          inventoryQuantity: 50,
          priceInPaise: 299900,
          currency: "INR",
          name: "Product",
        }),
      },
      checkoutApproval: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue(undefined),
      },
      auditEvent: {
        create: vi.fn().mockResolvedValue(undefined),
      },
    };

    await expect(
      addCartItem(prisma as never, {
        merchantId: "m1",
        cartId: "c1",
        productId: "p1",
        quantity: 2,
      }),
    ).resolves.toBeDefined();

    const createArgs = cartItemCreate.mock.calls[0]?.[0] as {
      data: { unitPriceInPaise: number; totalPriceInPaise: number };
    };

    expect(createArgs.data.unitPriceInPaise).toBe(299900);
    expect(createArgs.data.totalPriceInPaise).toBe(599800);
  });
});

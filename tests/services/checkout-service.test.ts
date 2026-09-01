import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/cart-service", () => ({
  recalculateCart: vi.fn(),
}));

import { recalculateCart } from "../../src/services/cart-service";
import { validateCheckout } from "../../src/services/checkout-service";

describe("checkout service", () => {
  it("rejects empty cart", async () => {
    vi.mocked(recalculateCart).mockResolvedValue({
      id: "c1",
      merchantId: "m1",
      customerId: null,
      status: "ACTIVE",
      currency: "INR",
      subtotalInPaise: 0,
      totalInPaise: 0,
      itemCount: 0,
      items: [],
      updatedAt: new Date(),
    });

    const prisma = {
      cart: { findFirst: vi.fn().mockResolvedValue({ id: "c1", status: "ACTIVE" }) },
      customer: { findFirst: vi.fn().mockResolvedValue({ id: "cust1" }) },
      product: { findMany: vi.fn().mockResolvedValue([]) },
      merchant: { findUnique: vi.fn().mockResolvedValue({ currency: "INR" }) },
      auditEvent: { create: vi.fn().mockResolvedValue(undefined) },
    };

    const result = await validateCheckout(prisma as never, {
      merchantId: "m1",
      cartId: "c1",
      customerId: "cust1",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Cart is empty");
  });
});

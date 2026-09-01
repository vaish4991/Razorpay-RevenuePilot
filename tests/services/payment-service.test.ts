import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/cart-service", () => ({
  getCart: vi.fn(),
}));
vi.mock("../../src/services/checkout-service", () => ({
  verifyCheckoutApprovalForCart: vi.fn(),
}));

import { getCart } from "../../src/services/cart-service";
import { verifyCheckoutApprovalForCart } from "../../src/services/checkout-service";
import { executePayment } from "../../src/services/payment-service";

describe("payment service", () => {
  it("blocks payment without valid approval", async () => {
    vi.mocked(getCart).mockResolvedValue({
      id: "c1",
      merchantId: "m1",
      customerId: null,
      status: "ACTIVE",
      currency: "INR",
      subtotalInPaise: 1000,
      totalInPaise: 1000,
      itemCount: 1,
      items: [
        {
          id: "i1",
          productId: "p1",
          productName: "P",
          quantity: 1,
          unitPriceInPaise: 1000,
          totalPriceInPaise: 1000,
        },
      ],
      updatedAt: new Date(),
    });

    vi.mocked(verifyCheckoutApprovalForCart).mockResolvedValue({
      valid: false,
      reason: "Approval amount mismatch",
    });

    const prisma = {
      auditEvent: { create: vi.fn().mockResolvedValue(undefined) },
    };

    await expect(
      executePayment(prisma as never, {
        merchantId: "m1",
        cartId: "c1",
        approvalId: "a1",
      }),
    ).rejects.toThrow("Payment blocked");
  });
});

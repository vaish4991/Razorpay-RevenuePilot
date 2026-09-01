import { describe, expect, it, vi } from "vitest";

import { searchProducts } from "../../src/services/catalog-service";

describe("catalog service", () => {
  it("builds deterministic merchant-scoped search query", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "p1",
        merchantId: "m1",
        name: "Product 1",
        slug: "product-1",
        description: "Desc",
        category: "headphones",
        priceInPaise: 1000,
        currency: "INR",
        inventoryQuantity: 5,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const count = vi.fn().mockResolvedValue(1);
    const transaction = vi.fn(async (queries: Promise<unknown>[]) => Promise.all(queries));

    const prisma = {
      product: {
        findMany,
        count,
      },
      $transaction: transaction,
    };

    const result = await searchProducts(prisma as never, "m1", {
      query: "wireless",
      category: "headphones",
      minPriceInPaise: 100,
      maxPriceInPaise: 10000,
      activeOnly: true,
      page: 1,
      pageSize: 10,
      sortBy: "price",
      sortOrder: "asc",
    });

    expect(result.totalCount).toBe(1);
    const args = findMany.mock.calls[0]?.[0] as { where: { merchantId: string; active: boolean } };
    expect(args.where.merchantId).toBe("m1");
    expect(args.where.active).toBe(true);
  });
});

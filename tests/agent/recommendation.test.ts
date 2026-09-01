import { describe, expect, it } from "vitest";

import { buildRecommendations } from "../../src/agent/recommendation";
import type { AgentIntent } from "../../src/agent/types";

const intent: AgentIntent = {
  originalMessage: "Need wireless headphones under ₹8,000",
  normalizedMessage: "need wireless headphones under ₹8,000",
  keywords: ["wireless", "headphones"],
  category: "headphones",
  maxBudgetInPaise: 800000,
  quantity: 1,
};

describe("buildRecommendations", () => {
  it("prioritizes matching and in-budget active products", () => {
    const result = buildRecommendations(
      [
        {
          id: "p1",
          slug: "wireless-headphones",
          name: "Wireless Headphones",
          description: "Great for remote work",
          category: "headphones",
          priceInPaise: 699900,
          inventoryQuantity: 30,
          active: true,
          metadata: { relatedSlugs: ["mic"] },
        },
        {
          id: "p2",
          slug: "expensive-headphones",
          name: "Premium Headphones",
          description: "High-end audio",
          category: "headphones",
          priceInPaise: 1200000,
          inventoryQuantity: 10,
          active: true,
          metadata: null,
        },
      ],
      intent,
      2,
    );

    expect(result).toHaveLength(2);
    expect(result[0]?.productId).toBe("p1");
    expect(result[0]?.reason).toContain("within your");
  });
});

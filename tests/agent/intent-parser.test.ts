import { describe, expect, it } from "vitest";

import { parseShoppingIntent } from "../../src/agent/intent-parser";

describe("parseShoppingIntent", () => {
  it("extracts category, budget and keywords", () => {
    const intent = parseShoppingIntent("I need wireless headphones under ₹8,000 for remote work");

    expect(intent.category).toBe("headphones");
    expect(intent.maxBudgetInPaise).toBe(800000);
    expect(intent.quantity).toBe(1);
    expect(intent.keywords).toContain("wireless");
    expect(intent.keywords).toContain("headphones");
  });

  it("extracts quantity from request", () => {
    const intent = parseShoppingIntent("Give me 2 webcams under ₹5,000");

    expect(intent.category).toBe("webcams");
    expect(intent.quantity).toBe(2);
    expect(intent.maxBudgetInPaise).toBe(500000);
  });
});

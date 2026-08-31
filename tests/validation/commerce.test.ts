import { describe, expect, it } from "vitest";

import {
  assertNonNegativeMoney,
  assertPositiveQuantity,
  calculateTotalInPaise,
} from "../../src/validation/commerce";

describe("commerce validation", () => {
  it("accepts integer paise monetary values", () => {
    expect(assertNonNegativeMoney(149900, "priceInPaise")).toBe(149900);
  });

  it("rejects non-integer money values", () => {
    expect(() => assertNonNegativeMoney(1499.5, "priceInPaise")).toThrow(
      "priceInPaise must be an integer paise value",
    );
  });

  it("rejects negative product prices", () => {
    expect(() => assertNonNegativeMoney(-1, "priceInPaise")).toThrow(
      "priceInPaise cannot be negative",
    );
  });

  it("rejects invalid quantities", () => {
    expect(() => assertPositiveQuantity(0)).toThrow("quantity must be greater than zero");
    expect(() => assertPositiveQuantity(-2)).toThrow("quantity must be greater than zero");
    expect(() => assertPositiveQuantity(1.5)).toThrow("quantity must be an integer");
  });

  it("calculates totals without floating-point arithmetic", () => {
    const total = calculateTotalInPaise([
      { unitPriceInPaise: 1099900, quantity: 2 },
      { unitPriceInPaise: 79900, quantity: 3 },
    ]);

    expect(total).toBe(2439500);
    expect(Number.isInteger(total)).toBe(true);
  });
});

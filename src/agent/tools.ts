import type { CartSummary } from "@/services/cart-service";
import type { SearchProductsInput } from "@/validation/catalog";

export type AgentProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  priceInPaise: number;
  currency: string;
  inventoryQuantity: number;
  active: boolean;
};

export type AgentTools = {
  searchProducts: (input: SearchProductsInput) => Promise<{ products: AgentProduct[]; totalCount: number }>;
  getProduct: (productId: string) => Promise<AgentProduct>;
  createCart: (customerId?: string | null) => Promise<{ id: string }>;
  getCart: (cartId: string) => Promise<CartSummary>;
  addToCart: (cartId: string, productId: string, quantity: number) => Promise<CartSummary>;
  updateCartItem: (cartId: string, itemId: string, quantity: number) => Promise<CartSummary>;
  removeFromCart: (cartId: string, itemId: string) => Promise<CartSummary>;
  clearCart: (cartId: string) => Promise<CartSummary>;
  validateCheckout: (cartId: string, customerId?: string | null) => Promise<{ valid: boolean; errors: string[] }>;
  requestCheckoutApproval: (cartId: string, customerId?: string | null) => Promise<{ id: string }>;
};

export const ALLOWED_TOOL_NAMES = [
  "searchProducts",
  "getProduct",
  "createCart",
  "getCart",
  "addToCart",
  "updateCartItem",
  "removeFromCart",
  "clearCart",
  "validateCheckout",
  "requestCheckoutApproval",
] as const;

export type AllowedToolName = (typeof ALLOWED_TOOL_NAMES)[number];

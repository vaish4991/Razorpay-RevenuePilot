import { ServiceError } from "@/services/errors";

import { assertPositiveQuantity } from "./commerce";

export type CreateCartInput = {
  customerExternalReference?: string;
};

export type AddCartItemInput = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};

export function parseCreateCartInput(payload: unknown): CreateCartInput {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const body = payload as Record<string, unknown>;
  const customerExternalReference =
    typeof body.customerExternalReference === "string"
      ? body.customerExternalReference.trim() || undefined
      : undefined;

  return { customerExternalReference };
}

export function parseAddCartItemInput(payload: unknown): AddCartItemInput {
  if (!payload || typeof payload !== "object") {
    throw new ServiceError("BAD_REQUEST", "Request body must be an object");
  }

  const body = payload as Record<string, unknown>;
  const productId = body.productId;
  const quantity = body.quantity;

  if (typeof productId !== "string" || !productId.trim()) {
    throw new ServiceError("BAD_REQUEST", "productId is required");
  }

  if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
    throw new ServiceError("BAD_REQUEST", "quantity must be an integer");
  }

  return {
    productId: productId.trim(),
    quantity: assertPositiveQuantity(quantity),
  };
}

export function parseUpdateCartItemInput(payload: unknown): UpdateCartItemInput {
  if (!payload || typeof payload !== "object") {
    throw new ServiceError("BAD_REQUEST", "Request body must be an object");
  }

  const quantity = (payload as Record<string, unknown>).quantity;

  if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
    throw new ServiceError("BAD_REQUEST", "quantity must be an integer");
  }

  return { quantity: assertPositiveQuantity(quantity) };
}

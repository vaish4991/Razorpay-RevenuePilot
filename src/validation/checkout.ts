import { ServiceError } from "@/services/errors";

export type CheckoutValidateInput = {
  cartId: string;
  customerExternalReference?: string;
};

export type CheckoutApproveInput = CheckoutValidateInput & {
  reason?: string;
};

function assertStringField(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new ServiceError("BAD_REQUEST", `${key} is required`);
  }
  return value.trim();
}

export function parseCheckoutValidateInput(payload: unknown): CheckoutValidateInput {
  if (!payload || typeof payload !== "object") {
    throw new ServiceError("BAD_REQUEST", "Request body must be an object");
  }

  const body = payload as Record<string, unknown>;

  return {
    cartId: assertStringField(body, "cartId"),
    customerExternalReference:
      typeof body.customerExternalReference === "string"
        ? body.customerExternalReference.trim() || undefined
        : undefined,
  };
}

export function parseCheckoutApproveInput(payload: unknown): CheckoutApproveInput {
  const base = parseCheckoutValidateInput(payload);
  const body = payload as Record<string, unknown>;

  return {
    ...base,
    reason: typeof body.reason === "string" ? body.reason.trim() || undefined : undefined,
  };
}

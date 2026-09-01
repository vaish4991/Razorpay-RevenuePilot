import { ServiceError } from "@/services/errors";

export type PaymentExecuteInput = {
  cartId: string;
  approvalId: string;
  customerExternalReference?: string;
};

export function parsePaymentExecuteInput(payload: unknown): PaymentExecuteInput {
  if (!payload || typeof payload !== "object") {
    throw new ServiceError("BAD_REQUEST", "Request body must be an object");
  }

  const body = payload as Record<string, unknown>;

  const cartId = body.cartId;
  const approvalId = body.approvalId;

  if (typeof cartId !== "string" || !cartId.trim()) {
    throw new ServiceError("BAD_REQUEST", "cartId is required");
  }

  if (typeof approvalId !== "string" || !approvalId.trim()) {
    throw new ServiceError("BAD_REQUEST", "approvalId is required");
  }

  return {
    cartId: cartId.trim(),
    approvalId: approvalId.trim(),
    customerExternalReference:
      typeof body.customerExternalReference === "string"
        ? body.customerExternalReference.trim() || undefined
        : undefined,
  };
}

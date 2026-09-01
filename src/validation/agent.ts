import { ServiceError } from "@/services/errors";

export type AgentChatInput = {
  message: string;
  cartId?: string;
  customerExternalReference?: string;
};

export function parseAgentChatInput(payload: unknown): AgentChatInput {
  if (!payload || typeof payload !== "object") {
    throw new ServiceError("BAD_REQUEST", "Request body must be an object");
  }

  const body = payload as Record<string, unknown>;
  const message = body.message;

  if (typeof message !== "string" || !message.trim()) {
    throw new ServiceError("BAD_REQUEST", "message is required");
  }

  const cartId = typeof body.cartId === "string" && body.cartId.trim() ? body.cartId.trim() : undefined;
  const customerExternalReference =
    typeof body.customerExternalReference === "string" && body.customerExternalReference.trim()
      ? body.customerExternalReference.trim()
      : undefined;

  return {
    message: message.trim(),
    cartId,
    customerExternalReference,
  };
}

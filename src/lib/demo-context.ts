import "server-only";

import type { PrismaClient } from "@prisma/client";

import { ServiceError } from "@/services/errors";

const DEFAULT_MERCHANT_SLUG = process.env.DEMO_MERCHANT_SLUG ?? "novacart-electronics";

export async function getDemoMerchant(prisma: PrismaClient) {
  const merchant = await prisma.merchant.findUnique({
    where: { slug: DEFAULT_MERCHANT_SLUG },
    select: { id: true, slug: true, currency: true },
  });

  if (!merchant) {
    throw new ServiceError(
      "NOT_FOUND",
      `Demo merchant '${DEFAULT_MERCHANT_SLUG}' not found. Seed the database first.`,
    );
  }

  return merchant;
}

export async function resolveDemoCustomerId(
  prisma: PrismaClient,
  merchantId: string,
  customerExternalReference?: string,
) {
  if (!customerExternalReference) {
    return null;
  }

  const customer = await prisma.customer.findUnique({
    where: {
      merchantId_externalReference: {
        merchantId,
        externalReference: customerExternalReference,
      },
    },
    select: { id: true },
  });

  if (!customer) {
    throw new ServiceError("NOT_FOUND", "Customer not found for merchant");
  }

  return customer.id;
}

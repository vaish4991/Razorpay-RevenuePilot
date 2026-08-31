import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant, resolveDemoCustomerId } from "@/lib/demo-context";
import { createCart } from "@/services/cart-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { parseCreateCartInput } from "@/validation/cart";

export async function POST(request: Request) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const body = parseCreateCartInput(await request.json().catch(() => ({})));
    const customerId = await resolveDemoCustomerId(prisma, merchant.id, body.customerExternalReference);

    const cart = await createCart(prisma, {
      merchantId: merchant.id,
      customerId,
      actorType: customerId ? "CUSTOMER" : "SYSTEM",
    });

    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

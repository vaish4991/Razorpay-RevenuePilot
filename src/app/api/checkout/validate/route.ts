import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant, resolveDemoCustomerId } from "@/lib/demo-context";
import { validateCheckout } from "@/services/checkout-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { parseCheckoutValidateInput } from "@/validation/checkout";

export async function POST(request: Request) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const body = parseCheckoutValidateInput(await request.json());
    const customerId = await resolveDemoCustomerId(prisma, merchant.id, body.customerExternalReference);

    const result = await validateCheckout(prisma, {
      merchantId: merchant.id,
      cartId: body.cartId,
      customerId,
      actorType: "CUSTOMER",
    });

    return NextResponse.json(result, { status: result.valid ? 200 : 412 });
  } catch (error) {
    return handleApiError(error);
  }
}

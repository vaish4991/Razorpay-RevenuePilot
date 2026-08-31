import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant, resolveDemoCustomerId } from "@/lib/demo-context";
import { approveCheckout } from "@/services/checkout-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { parseCheckoutApproveInput } from "@/validation/checkout";

export async function POST(request: Request) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const body = parseCheckoutApproveInput(await request.json());
    const customerId = await resolveDemoCustomerId(prisma, merchant.id, body.customerExternalReference);

    const approval = await approveCheckout(prisma, {
      merchantId: merchant.id,
      cartId: body.cartId,
      customerId,
      reason: body.reason,
      actorType: "CUSTOMER",
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

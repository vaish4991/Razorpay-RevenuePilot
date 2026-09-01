import { NextResponse } from "next/server";

import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { prisma } from "@/database";
import { getDemoMerchant, resolveDemoCustomerId } from "@/lib/demo-context";
import { executePayment } from "@/services/payment-service";
import { parsePaymentExecuteInput } from "@/validation/payment";

export async function POST(request: Request) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const body = parsePaymentExecuteInput(await request.json());
    const customerId = await resolveDemoCustomerId(
      prisma,
      merchant.id,
      body.customerExternalReference ?? "cust_demo_001",
    );

    const result = await executePayment(prisma, {
      merchantId: merchant.id,
      cartId: body.cartId,
      approvalId: body.approvalId,
      customerId,
      actorType: "CUSTOMER",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

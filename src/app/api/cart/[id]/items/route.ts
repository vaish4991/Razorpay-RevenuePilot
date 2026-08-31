import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { addCartItem } from "@/services/cart-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { parseAddCartItemInput } from "@/validation/cart";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const { id } = await context.params;
    const body = parseAddCartItemInput(await request.json());

    const cart = await addCartItem(prisma, {
      merchantId: merchant.id,
      cartId: id,
      productId: body.productId,
      quantity: body.quantity,
      actorType: "CUSTOMER",
    });

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

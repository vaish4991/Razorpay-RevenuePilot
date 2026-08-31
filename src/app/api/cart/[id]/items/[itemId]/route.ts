import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { removeCartItem, updateCartItemQuantity } from "@/services/cart-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { parseUpdateCartItemInput } from "@/validation/cart";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const { id, itemId } = await context.params;
    const body = parseUpdateCartItemInput(await request.json());

    const cart = await updateCartItemQuantity(prisma, {
      merchantId: merchant.id,
      cartId: id,
      itemId,
      quantity: body.quantity,
      actorType: "CUSTOMER",
    });

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const { id, itemId } = await context.params;

    const cart = await removeCartItem(prisma, {
      merchantId: merchant.id,
      cartId: id,
      itemId,
      actorType: "CUSTOMER",
    });

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

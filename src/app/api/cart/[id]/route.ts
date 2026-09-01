import { NextResponse } from "next/server";

import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { clearCart, getCart } from "@/services/cart-service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const { id } = await context.params;

    const cart = await getCart(prisma, merchant.id, id);
    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const { id } = await context.params;

    const cart = await clearCart(prisma, {
      merchantId: merchant.id,
      cartId: id,
      actorType: "CUSTOMER",
    });

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

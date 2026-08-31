import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { getCart } from "@/services/cart-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";

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

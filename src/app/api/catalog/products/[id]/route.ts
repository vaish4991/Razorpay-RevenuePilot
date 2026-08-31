import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { getProduct } from "@/services/catalog-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const { id } = await context.params;

    const product = await getProduct(prisma, merchant.id, id);
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

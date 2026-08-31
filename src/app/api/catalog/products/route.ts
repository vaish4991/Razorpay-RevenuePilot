import { NextResponse } from "next/server";

import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { searchProducts } from "@/services/catalog-service";
import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { parseSearchProductsInput } from "@/validation/catalog";

export async function GET(request: Request) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const url = new URL(request.url);
    const input = parseSearchProductsInput(url.searchParams);

    const result = await searchProducts(prisma, merchant.id, input);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

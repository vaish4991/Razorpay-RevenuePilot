import { NextResponse } from "next/server";

import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { getDashboardMetrics } from "@/services/metrics-service";

export async function GET() {
  try {
    const merchant = await getDemoMerchant(prisma);
    const metrics = await getDashboardMetrics(prisma, merchant.id);

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

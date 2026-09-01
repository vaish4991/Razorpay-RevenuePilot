import { NextResponse } from "next/server";

import { handleApiError } from "@/app/api/_lib/handle-api-error";
import { prisma } from "@/database";
import { getDemoMerchant } from "@/lib/demo-context";
import { listRecentAuditEvents } from "@/services/activity-service";

export async function GET(request: Request) {
  try {
    const merchant = await getDemoMerchant(prisma);
    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "100", 10);

    const events = await listRecentAuditEvents(prisma, merchant.id, Number.isInteger(limit) ? limit : 100);
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

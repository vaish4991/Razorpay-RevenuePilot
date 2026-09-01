import type { PrismaClient } from "@prisma/client";

export type DashboardMetrics = {
  conversations: number;
  productSearches: number;
  recommendations: number;
  addToCartEvents: number;
  checkoutValidations: number;
  approvals: number;
  conversions: number;
  conversionRatePercent: number;
  revenueInfluencedInPaise: number;
  averageOrderValueInPaise: number;
  label: "Synthetic Demo Metrics";
};

export async function getDashboardMetrics(prisma: PrismaClient, merchantId: string): Promise<DashboardMetrics> {
  const [
    conversations,
    productSearches,
    recommendations,
    addToCartEvents,
    checkoutValidations,
    approvals,
    successfulOrders,
  ] = await Promise.all([
    prisma.auditEvent.count({ where: { merchantId, action: "AGENT_SESSION_STARTED" } }),
    prisma.auditEvent.count({ where: { merchantId, action: "PRODUCT_SEARCHED" } }),
    prisma.auditEvent.count({ where: { merchantId, action: "PRODUCT_RECOMMENDED" } }),
    prisma.auditEvent.count({ where: { merchantId, action: "CART_ITEM_ADDED" } }),
    prisma.auditEvent.count({ where: { merchantId, action: "CHECKOUT_VALIDATED" } }),
    prisma.auditEvent.count({ where: { merchantId, action: "CHECKOUT_APPROVED" } }),
    prisma.order.findMany({
      where: { merchantId, status: { in: ["PAID", "PAYMENT_PENDING"] } },
      select: { totalInPaise: true },
    }),
  ]);

  const conversions = successfulOrders.length;
  const revenueInfluencedInPaise = successfulOrders.reduce((sum, order) => sum + order.totalInPaise, 0);
  const averageOrderValueInPaise = conversions > 0 ? Math.floor(revenueInfluencedInPaise / conversions) : 0;
  const conversionRatePercent = approvals > 0 ? Number(((conversions / approvals) * 100).toFixed(2)) : 0;

  return {
    conversations,
    productSearches,
    recommendations,
    addToCartEvents,
    checkoutValidations,
    approvals,
    conversions,
    conversionRatePercent,
    revenueInfluencedInPaise,
    averageOrderValueInPaise,
    label: "Synthetic Demo Metrics",
  };
}

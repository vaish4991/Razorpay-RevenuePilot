import type { PrismaClient } from "@prisma/client";

export async function listRecentAuditEvents(prisma: PrismaClient, merchantId: string, limit = 100) {
  return prisma.auditEvent.findMany({
    where: {
      merchantId,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Math.min(Math.max(limit, 1), 200),
  });
}

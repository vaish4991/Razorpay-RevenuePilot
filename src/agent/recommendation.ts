import type { Product } from "@prisma/client";

import type { AgentIntent, AgentRecommendation } from "@/agent/types";

type ProductWithMetadata = Pick<
  Product,
  "id" | "slug" | "name" | "description" | "category" | "priceInPaise" | "inventoryQuantity" | "active" | "metadata"
>;

function parseRelatedSlugs(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== "object") {
    return [];
  }

  const relatedSlugs = (metadata as { relatedSlugs?: unknown }).relatedSlugs;
  if (!Array.isArray(relatedSlugs)) {
    return [];
  }

  return relatedSlugs.filter((slug): slug is string => typeof slug === "string");
}

function scoreProduct(product: ProductWithMetadata, intent: AgentIntent): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  const normalizedName = product.name.toLowerCase();
  const normalizedDescription = product.description.toLowerCase();

  if (intent.category && product.category === intent.category) {
    score += 40;
    reasons.push(`matches your ${intent.category.replace("-", " ")} requirement`);
  }

  const keywordMatches = intent.keywords.filter(
    (keyword) => normalizedName.includes(keyword) || normalizedDescription.includes(keyword),
  ).length;

  if (keywordMatches > 0) {
    score += keywordMatches * 8;
    reasons.push(`matches ${keywordMatches} of your keywords`);
  }

  if (intent.maxBudgetInPaise !== undefined && product.priceInPaise <= intent.maxBudgetInPaise) {
    score += 25;
    reasons.push(`within your ₹${(intent.maxBudgetInPaise / 100).toLocaleString("en-IN")} budget`);
  }

  if (intent.minBudgetInPaise !== undefined && product.priceInPaise >= intent.minBudgetInPaise) {
    score += 8;
  }

  if (product.inventoryQuantity >= intent.quantity) {
    score += 15;
    reasons.push("currently in stock");
  }

  if (product.active) {
    score += 10;
  }

  const relatedSlugs = parseRelatedSlugs(product.metadata);
  if (relatedSlugs.length > 0) {
    score += 3;
  }

  return {
    score,
    reason: reasons.length > 0 ? reasons.join(", ") : "relevant to your request",
  };
}

export function buildRecommendations(
  products: ProductWithMetadata[],
  intent: AgentIntent,
  limit = 6,
): AgentRecommendation[] {
  return products
    .filter((product) => product.active)
    .map((product) => {
      const scoring = scoreProduct(product, intent);
      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        description: product.description,
        priceInPaise: product.priceInPaise,
        inventoryQuantity: product.inventoryQuantity,
        score: scoring.score,
        reason: `Recommended because it ${scoring.reason}.`,
      };
    })
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.priceInPaise - b.priceInPaise))
    .slice(0, limit);
}

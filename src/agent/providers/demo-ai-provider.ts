import type { AgentIntent, AgentResponse } from "@/agent/types";
import { parseShoppingIntent } from "@/agent/intent-parser";
import { buildRecommendations } from "@/agent/recommendation";
import type { AgentTools } from "@/agent/tools";

export async function runDemoAiShoppingAgent(message: string, tools: AgentTools): Promise<AgentResponse> {
  const intent = parseShoppingIntent(message);
  const searchInput = toSearchInput(intent);

  const searchResult = await tools.searchProducts(searchInput);
  const recommendations = buildRecommendations(searchResult.products, intent, 6);

  return {
    mode: "demo",
    modeLabel: "Demo AI — deterministic synthetic-data mode",
    interpretation: {
      category: intent.category,
      maxBudgetInPaise: intent.maxBudgetInPaise,
      quantity: intent.quantity,
      keywords: intent.keywords,
    },
    productsFound: searchResult.totalCount,
    recommendations,
    message: buildAssistantMessage(intent, recommendations.length),
  };
}

function toSearchInput(intent: AgentIntent) {
  return {
    query: intent.keywords.join(" ") || undefined,
    category: intent.category,
    minPriceInPaise: intent.minBudgetInPaise,
    maxPriceInPaise: intent.maxBudgetInPaise,
    activeOnly: true,
    page: 1,
    pageSize: 12,
    sortBy: "price" as const,
    sortOrder: "asc" as const,
  };
}

function buildAssistantMessage(intent: AgentIntent, count: number) {
  if (count === 0) {
    return "I couldn’t find a strong match yet. Try broadening your budget or removing a filter.";
  }

  if (intent.category && intent.maxBudgetInPaise) {
    return `I found ${count} options for ${intent.category.replace("-", " ")} under ₹${(intent.maxBudgetInPaise / 100).toLocaleString("en-IN")}.`;
  }

  return `I found ${count} relevant products and ranked them by deterministic fit.`;
}

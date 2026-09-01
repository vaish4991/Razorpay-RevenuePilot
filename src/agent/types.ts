export type AgentIntent = {
  originalMessage: string;
  normalizedMessage: string;
  keywords: string[];
  category?: string;
  maxBudgetInPaise?: number;
  minBudgetInPaise?: number;
  quantity: number;
};

export type AgentRecommendation = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  priceInPaise: number;
  inventoryQuantity: number;
  score: number;
  reason: string;
};

export type AgentResponse = {
  mode: "demo" | "llm";
  modeLabel: string;
  interpretation: {
    category?: string;
    maxBudgetInPaise?: number;
    quantity: number;
    keywords: string[];
  };
  productsFound: number;
  recommendations: AgentRecommendation[];
  message: string;
};

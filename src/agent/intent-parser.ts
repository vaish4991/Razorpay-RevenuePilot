import type { AgentIntent } from "@/agent/types";

const CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  { category: "headphones", keywords: ["headphone", "headphones", "earbuds", "wireless audio"] },
  { category: "keyboards", keywords: ["keyboard", "keyboards", "mechanical keyboard"] },
  { category: "mice", keywords: ["mouse", "mice", "trackball"] },
  { category: "webcams", keywords: ["webcam", "camera", "video call"] },
  { category: "microphones", keywords: ["microphone", "mic", "podcast", "streaming"] },
  { category: "laptop-stands", keywords: ["laptop stand", "stand", "ergonomic stand"] },
  { category: "usb-hubs", keywords: ["usb hub", "dock", "usb-c hub"] },
  { category: "monitors", keywords: ["monitor", "display", "screen"] },
  { category: "chargers", keywords: ["charger", "charging", "gan"] },
  { category: "accessories", keywords: ["accessory", "desk mat", "wrist rest", "cable"] },
];

function extractBudgetInPaise(message: string): { min?: number; max?: number } {
  const underMatch = message.match(/(?:under|below|less than)\s*₹?\s*(\d+[\d,]*)/i);
  if (underMatch) {
    const amount = Number.parseInt(underMatch[1].replaceAll(",", ""), 10);
    if (Number.isInteger(amount)) {
      return { max: amount * 100 };
    }
  }

  const betweenMatch = message.match(/between\s*₹?\s*(\d+[\d,]*)\s*(?:and|to)\s*₹?\s*(\d+[\d,]*)/i);
  if (betweenMatch) {
    const min = Number.parseInt(betweenMatch[1].replaceAll(",", ""), 10);
    const max = Number.parseInt(betweenMatch[2].replaceAll(",", ""), 10);
    if (Number.isInteger(min) && Number.isInteger(max) && min <= max) {
      return { min: min * 100, max: max * 100 };
    }
  }

  return {};
}

function extractQuantity(message: string): number {
  const quantityMatch = message.match(/(?:^|\s)(\d+)\s*(?:x\s*)?(?:items?|units?|headphones?|keyboards?|mice|webcams?|microphones?)/i);
  if (quantityMatch) {
    const quantity = Number.parseInt(quantityMatch[1], 10);
    if (Number.isInteger(quantity) && quantity > 0) {
      return quantity;
    }
  }
  return 1;
}

function extractCategory(message: string): string | undefined {
  const normalized = message.toLowerCase();
  for (const category of CATEGORY_KEYWORDS) {
    if (category.keywords.some((keyword) => normalized.includes(keyword))) {
      return category.category;
    }
  }
  return undefined;
}

function extractKeywords(message: string): string[] {
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !["i", "need", "a", "an", "the", "for", "with", "under", "and", "me"].includes(word));

  return Array.from(new Set(normalized)).slice(0, 8);
}

export function parseShoppingIntent(message: string): AgentIntent {
  const normalizedMessage = message.trim().toLowerCase();
  const budgets = extractBudgetInPaise(message);

  return {
    originalMessage: message,
    normalizedMessage,
    keywords: extractKeywords(message),
    category: extractCategory(message),
    maxBudgetInPaise: budgets.max,
    minBudgetInPaise: budgets.min,
    quantity: extractQuantity(message),
  };
}

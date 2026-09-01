import type { AgentResponse } from "@/agent/types";
import type { AgentTools } from "@/agent/tools";

import { runDemoAiShoppingAgent } from "@/agent/providers/demo-ai-provider";

export async function runOptionalLlmShoppingAgent(
  message: string,
  tools: AgentTools,
): Promise<AgentResponse> {
  // Trust boundary: until a vetted function-calling integration is added, we keep this provider deterministic
  // and route through allowlisted tools only.
  const response = await runDemoAiShoppingAgent(message, tools);
  return {
    ...response,
    mode: "llm",
    modeLabel: "LLM provider configured — deterministic tool-constrained mode",
  };
}

import type { AgentResponse } from "@/agent/types";
import type { AgentTools } from "@/agent/tools";
import { runDemoAiShoppingAgent } from "@/agent/providers/demo-ai-provider";
import { runOptionalLlmShoppingAgent } from "@/agent/providers/llm-ai-provider";

export async function runShoppingAgent(message: string, tools: AgentTools): Promise<AgentResponse> {
  if (process.env.LLM_API_KEY && process.env.LLM_API_KEY !== "replace_with_llm_api_key") {
    return runOptionalLlmShoppingAgent(message, tools);
  }

  return runDemoAiShoppingAgent(message, tools);
}

export * from "./intent-parser";
export * from "./tools";
export * from "./types";

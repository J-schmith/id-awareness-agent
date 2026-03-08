import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";
import { researchSystemPrompt, researchUserPrompt } from "./prompts";
import type { ResearchResult } from "./types";

/**
 * Use Claude with web search to discover awareness days for a given quarter.
 */
export async function researchAwarenessDays(options: {
  quarter: string;
  themes: { id: string; label: string }[];
  existingDays: string[];
}): Promise<ResearchResult[]> {
  const { quarter, themes, existingDays } = options;

  const client = new Anthropic({
    apiKey: config.ANTHROPIC_API_KEY,
  });

  const themeLabels = themes.map((t) => t.label);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: researchSystemPrompt(),
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 10,
      } as unknown as Anthropic.Tool,
    ],
    messages: [
      {
        role: "user",
        content: researchUserPrompt(quarter, themeLabels, existingDays),
      },
    ],
  });

  // Extract text blocks from the response
  const textBlocks = response.content.filter(
    (block) => block.type === "text",
  );
  const rawText = textBlocks.map((block) => block.text).join("\n");

  // Parse the JSON array from the response
  const parsed = parseJsonArray(rawText);

  // Validate and return
  return parsed.filter(isValidResearchResult);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsonArray(text: string): unknown[] {
  // Try direct parse first
  try {
    const result = JSON.parse(text);
    if (Array.isArray(result)) return result;
  } catch {
    // Fall through
  }

  // Try to extract a JSON array from the text
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const result = JSON.parse(match[0]);
      if (Array.isArray(result)) return result;
    } catch {
      // Fall through
    }
  }

  return [];
}

function isValidResearchResult(item: unknown): item is ResearchResult {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.date === "string" &&
    typeof obj.themeLabel === "string" &&
    typeof obj.sourceUrl === "string" &&
    typeof obj.description === "string" &&
    ["high", "medium", "low"].includes(obj.confidence as string)
  );
}

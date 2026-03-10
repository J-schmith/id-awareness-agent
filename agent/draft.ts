import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";
import { draftSystemPrompt, draftUserPrompt, refinementPrompt } from "./prompts";
import { fetchAwarenessDayImage } from "./image";
import type { DraftResult } from "./types";

/**
 * Generate an email draft for an upcoming awareness day.
 */
export async function generateDraft(awarenessDay: {
  name: string;
  date: Date;
  theme: { label: string };
  sourceUrl?: string | null;
  sourceNotes?: string | null;
}): Promise<DraftResult> {
  const client = new Anthropic({
    apiKey: config.ANTHROPIC_API_KEY,
  });

  const researchNotes = [
    awarenessDay.sourceNotes ?? "",
    awarenessDay.sourceUrl ? `Source: ${awarenessDay.sourceUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const dateStr = awarenessDay.date.toISOString().split("T")[0];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: draftSystemPrompt(),
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      } as unknown as Anthropic.Tool,
    ],
    messages: [
      {
        role: "user",
        content: draftUserPrompt(
          awarenessDay.name,
          dateStr,
          awarenessDay.theme.label,
          researchNotes,
        ),
      },
    ],
  });

  const textBlocks = response.content.filter(
    (block) => block.type === "text",
  );
  const rawText = textBlocks.map((block) => block.text).join("\n");

  const parsed = parseJsonObject(rawText);
  if (!parsed || typeof parsed.subject !== "string" || typeof parsed.body !== "string") {
    throw new Error("Failed to parse draft response from Claude");
  }

  // Extract cited sources from web_search_tool_result blocks
  const sourcesCited: string[] = [];
  for (const block of response.content) {
    const b = block as unknown as Record<string, unknown>;
    if (b.type === "web_search_tool_result" && "search_results" in b) {
      const results = b.search_results;
      if (Array.isArray(results)) {
        for (const r of results) {
          if (typeof r === "object" && r !== null && "url" in r) {
            sourcesCited.push((r as { url: string }).url);
          }
        }
      }
    }
  }

  // Extract image keywords suggested by Claude
  const imageKeywords = Array.isArray(parsed.imageKeywords)
    ? (parsed.imageKeywords as unknown[]).filter((k): k is string => typeof k === "string")
    : undefined;

  // Fetch a hero image from Unsplash
  const image = await fetchAwarenessDayImage({
    dayName: awarenessDay.name,
    themeLabel: awarenessDay.theme.label,
    keywords: imageKeywords,
  }).catch((err) => {
    console.error("[agent/draft] Failed to fetch image:", err);
    return null;
  });

  return {
    subject: parsed.subject,
    body: parsed.body,
    sourcesCited: Array.from(new Set(sourcesCited)),
    imageUrl: image?.imageUrl,
    imageAlt: image?.imageAlt,
    imageCredit: image?.imageCredit,
  };
}

/**
 * Refine a previously rejected draft based on editor feedback.
 */
export async function refineDraft(
  originalDraft: string,
  rejectionReason: string,
): Promise<DraftResult> {
  const client = new Anthropic({
    apiKey: config.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: draftSystemPrompt(),
    messages: [
      {
        role: "user",
        content: refinementPrompt(originalDraft, rejectionReason),
      },
    ],
  });

  const textBlocks = response.content.filter(
    (block) => block.type === "text",
  );
  const rawText = textBlocks.map((block) => block.text).join("\n");

  const parsed = parseJsonObject(rawText);
  if (!parsed || typeof parsed.subject !== "string" || typeof parsed.body !== "string") {
    throw new Error("Failed to parse refined draft response from Claude");
  }

  return {
    subject: parsed.subject,
    body: parsed.body,
    sourcesCited: [],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const result = JSON.parse(text);
    if (typeof result === "object" && result !== null && !Array.isArray(result)) {
      return result as Record<string, unknown>;
    }
  } catch {
    // Fall through
  }

  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const result = JSON.parse(match[0]);
      if (typeof result === "object" && result !== null && !Array.isArray(result)) {
        return result as Record<string, unknown>;
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

"use server"

import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"

const ACTOR = "system"

export async function triggerResearch(formData: FormData) {
  try {
    const themeIds = formData.getAll("themeIds") as string[]

    if (themeIds.length === 0) {
      return { success: false, error: "At least one theme must be selected" }
    }

    // TODO: wire up the real research agent
    // import { runResearch } from "@/agent/research"
    // await runResearch(themeIds)

    await logAction({
      action: "agent.research_started",
      entityType: "Agent",
      entityId: "research",
      actor: ACTOR,
      metadata: { themeIds },
    })

    revalidatePath("/awareness-days")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to trigger research" }
  }
}

export async function triggerDraftGeneration(awarenessDayId: string) {
  try {
    // TODO: wire up the real draft generation agent
    // import { generateDraft } from "@/agent/draft"
    // await generateDraft(awarenessDayId)

    await logAction({
      action: "agent.draft_generation_started",
      entityType: "Agent",
      entityId: awarenessDayId,
      actor: ACTOR,
      metadata: { awarenessDayId },
    })

    revalidatePath("/awareness-days")
    revalidatePath("/approvals")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to trigger draft generation" }
  }
}

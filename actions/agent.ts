"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logAction } from "@/lib/audit"
import { researchAwarenessDays } from "@/agent/research"
import { generateDraft } from "@/agent/draft"

const ACTOR = "system"

export async function triggerResearch(formData: FormData) {
  try {
    const themeIds = formData.getAll("themeIds") as string[]

    if (themeIds.length === 0) {
      return { success: false, error: "At least one theme must be selected" }
    }

    // Load selected themes
    const themes = await prisma.theme.findMany({
      where: { id: { in: themeIds }, active: true },
    })

    if (themes.length === 0) {
      return { success: false, error: "No active themes found" }
    }

    // Determine quarter
    const now = new Date()
    const currentQ = Math.floor(now.getMonth() / 3) + 1
    const quarter = `Q${currentQ} ${now.getFullYear()}`

    // Get existing days to avoid duplicates
    const existingDays = await prisma.awarenessDay.findMany({
      where: { themeId: { in: themeIds } },
      select: { name: true },
    })

    await logAction({
      action: "agent.research_started",
      entityType: "Agent",
      entityId: "research",
      actor: ACTOR,
      metadata: { themeIds },
    })

    // Run research
    const results = await researchAwarenessDays({
      quarter,
      themes: themes.map((t) => ({ id: t.id, label: t.label })),
      existingDays: existingDays.map((d) => d.name),
    })

    // Upsert discovered days
    for (const result of results) {
      const theme = themes.find((t) => t.label === result.themeLabel)
      if (!theme) continue

      const dateObj = new Date(result.date)
      if (isNaN(dateObj.getTime())) continue

      const existing = await prisma.awarenessDay.findFirst({
        where: { name: result.name, date: dateObj },
      })

      if (!existing) {
        await prisma.awarenessDay.create({
          data: {
            name: result.name,
            date: dateObj,
            themeId: theme.id,
            sourceUrl: result.sourceUrl,
            sourceNotes: result.description,
            status: "discovered",
          },
        })
      }
    }

    revalidatePath("/awareness-days")
    revalidatePath("/themes")
    revalidatePath("/dashboard")
    return { success: true, daysDiscovered: results.length }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to trigger research" }
  }
}

export async function triggerDraftGeneration(awarenessDayId: string) {
  try {
    const day = await prisma.awarenessDay.findUnique({
      where: { id: awarenessDayId },
      include: { theme: true },
    })

    if (!day) {
      return { success: false, error: "Awareness day not found" }
    }

    await logAction({
      action: "agent.draft_generation_started",
      entityType: "Agent",
      entityId: awarenessDayId,
      actor: ACTOR,
      metadata: { awarenessDayId },
    })

    const draftResult = await generateDraft({
      name: day.name,
      date: day.date,
      theme: { label: day.theme.label },
      sourceUrl: day.sourceUrl,
      sourceNotes: day.sourceNotes,
    })

    await prisma.messageDraft.create({
      data: {
        awarenessDayId: day.id,
        subject: draftResult.subject,
        body: draftResult.body,
        imageUrl: draftResult.imageUrl ?? null,
        imageAlt: draftResult.imageAlt ?? null,
        imageCredit: draftResult.imageCredit ?? null,
        status: "pending",
        version: 1,
      },
    })

    revalidatePath("/awareness-days")
    revalidatePath("/approvals")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to trigger draft generation" }
  }
}

"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logAction } from "@/lib/audit"
import { awarenessDaySchema } from "@/lib/validations"

const ACTOR = "system"

export async function confirmDay(id: string) {
  try {
    await prisma.awarenessDay.update({
      where: { id },
      data: { status: "confirmed" },
    })

    await logAction({
      action: "awareness_day.confirmed",
      entityType: "AwarenessDay",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/awareness-days")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to confirm day" }
  }
}

export async function skipDay(id: string) {
  try {
    await prisma.awarenessDay.update({
      where: { id },
      data: { status: "skipped" },
    })

    await logAction({
      action: "awareness_day.skipped",
      entityType: "AwarenessDay",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/awareness-days")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to skip day" }
  }
}

export async function createDay(formData: FormData) {
  try {
    const raw = {
      name: formData.get("name") as string,
      date: formData.get("date") as string,
      themeId: formData.get("themeId") as string,
      sourceUrl: formData.get("sourceUrl") as string | undefined,
    }

    const parsed = awarenessDaySchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const day = await prisma.awarenessDay.create({
      data: {
        name: parsed.data.name,
        date: parsed.data.date,
        themeId: parsed.data.themeId,
        sourceUrl: parsed.data.sourceUrl || null,
      },
    })

    await logAction({
      action: "awareness_day.created",
      entityType: "AwarenessDay",
      entityId: day.id,
      actor: ACTOR,
    })

    revalidatePath("/awareness-days")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create awareness day" }
  }
}

export async function updateDay(id: string, formData: FormData) {
  try {
    const raw = {
      name: formData.get("name") as string,
      date: formData.get("date") as string,
      themeId: formData.get("themeId") as string,
      sourceUrl: formData.get("sourceUrl") as string | undefined,
    }

    const parsed = awarenessDaySchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    await prisma.awarenessDay.update({
      where: { id },
      data: {
        name: parsed.data.name,
        date: parsed.data.date,
        themeId: parsed.data.themeId,
        sourceUrl: parsed.data.sourceUrl || null,
      },
    })

    await logAction({
      action: "awareness_day.updated",
      entityType: "AwarenessDay",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/awareness-days")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update awareness day" }
  }
}

export async function deleteDay(id: string) {
  try {
    // MessageDrafts cascade-delete via the schema's onDelete: Cascade
    await prisma.awarenessDay.delete({ where: { id } })

    await logAction({
      action: "awareness_day.deleted",
      entityType: "AwarenessDay",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/awareness-days")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete awareness day" }
  }
}

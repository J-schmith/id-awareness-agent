"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logAction } from "@/lib/audit"
import { themeSchema } from "@/lib/validations"

const ACTOR = "system" // replace with session user when auth is wired up

export async function createTheme(formData: FormData) {
  try {
    const raw = {
      label: formData.get("label") as string,
      description: formData.get("description") as string | undefined,
      color: formData.get("color") as string | undefined,
    }

    const parsed = themeSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const theme = await prisma.theme.create({ data: parsed.data })

    await logAction({
      action: "theme.created",
      entityType: "Theme",
      entityId: theme.id,
      actor: ACTOR,
    })

    revalidatePath("/themes")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create theme" }
  }
}

export async function updateTheme(id: string, formData: FormData) {
  try {
    const raw = {
      label: formData.get("label") as string,
      description: formData.get("description") as string | undefined,
      color: formData.get("color") as string | undefined,
    }

    const parsed = themeSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    await prisma.theme.update({ where: { id }, data: parsed.data })

    await logAction({
      action: "theme.updated",
      entityType: "Theme",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/themes")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update theme" }
  }
}

export async function toggleTheme(id: string) {
  try {
    const existing = await prisma.theme.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: "Theme not found" }
    }

    await prisma.theme.update({
      where: { id },
      data: { active: !existing.active },
    })

    await logAction({
      action: existing.active ? "theme.deactivated" : "theme.activated",
      entityType: "Theme",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/themes")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to toggle theme" }
  }
}

export async function deleteTheme(id: string) {
  try {
    // Cascade: delete awareness days (and their drafts) belonging to this theme
    await prisma.awarenessDay.deleteMany({ where: { themeId: id } })
    await prisma.theme.delete({ where: { id } })

    await logAction({
      action: "theme.deleted",
      entityType: "Theme",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/themes")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete theme" }
  }
}

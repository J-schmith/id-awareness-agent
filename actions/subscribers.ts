"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logAction } from "@/lib/audit"
import { subscriberSchema, csvImportSchema } from "@/lib/validations"
import { parse } from "csv-parse/sync"

const ACTOR = "system"

export async function createSubscriber(formData: FormData) {
  try {
    const raw = {
      email: formData.get("email") as string,
      name: formData.get("name") as string | undefined,
      segments: formData.getAll("segments") as string[],
    }

    const parsed = subscriberSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name || null,
        segments: JSON.stringify(parsed.data.segments),
      },
    })

    await logAction({
      action: "subscriber.created",
      entityType: "Subscriber",
      entityId: subscriber.id,
      actor: ACTOR,
    })

    revalidatePath("/subscribers")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create subscriber" }
  }
}

export async function updateSubscriber(id: string, formData: FormData) {
  try {
    const raw = {
      email: formData.get("email") as string,
      name: formData.get("name") as string | undefined,
      segments: formData.getAll("segments") as string[],
    }

    const parsed = subscriberSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    await prisma.subscriber.update({
      where: { id },
      data: {
        email: parsed.data.email,
        name: parsed.data.name || null,
        segments: JSON.stringify(parsed.data.segments),
      },
    })

    await logAction({
      action: "subscriber.updated",
      entityType: "Subscriber",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/subscribers")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update subscriber" }
  }
}

export async function deleteSubscriber(id: string) {
  try {
    await prisma.subscriber.delete({ where: { id } })

    await logAction({
      action: "subscriber.deleted",
      entityType: "Subscriber",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/subscribers")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete subscriber" }
  }
}

export async function optOutSubscriber(id: string) {
  try {
    await prisma.subscriber.update({
      where: { id },
      data: { optedOut: true },
    })

    await logAction({
      action: "subscriber.opted_out",
      entityType: "Subscriber",
      entityId: id,
      actor: ACTOR,
    })

    revalidatePath("/subscribers")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to opt out subscriber" }
  }
}

export async function importSubscribersCSV(formData: FormData) {
  try {
    const file = formData.get("file") as File | null
    if (!file) {
      return { success: false, imported: 0, errors: ["No file provided"] }
    }

    const text = await file.text()
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[]

    let imported = 0
    const errors: string[] = []

    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const parsed = csvImportSchema.safeParse(row)

      if (!parsed.success) {
        errors.push(`Row ${i + 1}: ${parsed.error.errors[0].message}`)
        continue
      }

      try {
        await prisma.subscriber.upsert({
          where: { email: parsed.data.email },
          create: {
            email: parsed.data.email,
            name: parsed.data.name || null,
            segments: JSON.stringify(parsed.data.segments),
          },
          update: {
            name: parsed.data.name || undefined,
            segments: JSON.stringify(parsed.data.segments),
          },
        })
        imported++
      } catch (rowErr) {
        errors.push(
          `Row ${i + 1} (${parsed.data.email}): ${rowErr instanceof Error ? rowErr.message : "Unknown error"}`
        )
      }
    }

    await logAction({
      action: "subscriber.bulk_import",
      entityType: "Subscriber",
      entityId: "bulk",
      actor: ACTOR,
      metadata: { imported, totalRows: records.length, errorCount: errors.length },
    })

    revalidatePath("/subscribers")
    return { success: true, imported, errors }
  } catch (err) {
    return {
      success: false,
      imported: 0,
      errors: [err instanceof Error ? err.message : "Failed to import CSV"],
    }
  }
}

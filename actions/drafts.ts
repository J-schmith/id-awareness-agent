"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logAction } from "@/lib/audit"
import { draftUpdateSchema } from "@/lib/validations"

const ACTOR = "system"

export async function approveDraft(draftId: string) {
  try {
    const draft = await prisma.messageDraft.findUnique({
      where: { id: draftId },
      include: { awarenessDay: true },
    })

    if (!draft) {
      return { success: false, error: "Draft not found" }
    }

    if (draft.status !== "pending") {
      return { success: false, error: `Draft is already ${draft.status}` }
    }

    await prisma.$transaction([
      prisma.messageDraft.update({
        where: { id: draftId },
        data: {
          status: "approved",
          approvedBy: ACTOR,
          approvedAt: new Date(),
        },
      }),
      prisma.scheduledSend.create({
        data: {
          draftId,
          sendDate: draft.awarenessDay.date,
        },
      }),
    ])

    await logAction({
      action: "draft.approved",
      entityType: "MessageDraft",
      entityId: draftId,
      actor: ACTOR,
    })

    revalidatePath("/approvals")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to approve draft" }
  }
}

export async function rejectDraft(draftId: string, reason: string) {
  try {
    const draft = await prisma.messageDraft.findUnique({ where: { id: draftId } })

    if (!draft) {
      return { success: false, error: "Draft not found" }
    }

    if (draft.status !== "pending") {
      return { success: false, error: `Draft is already ${draft.status}` }
    }

    await prisma.messageDraft.update({
      where: { id: draftId },
      data: {
        status: "rejected",
        rejectionReason: reason,
      },
    })

    await logAction({
      action: "draft.rejected",
      entityType: "MessageDraft",
      entityId: draftId,
      actor: ACTOR,
      metadata: { reason },
    })

    revalidatePath("/approvals")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to reject draft" }
  }
}

export async function updateDraft(draftId: string, formData: FormData) {
  try {
    const raw = {
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
    }

    const parsed = draftUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const existing = await prisma.messageDraft.findUnique({ where: { id: draftId } })
    if (!existing) {
      return { success: false, error: "Draft not found" }
    }

    await prisma.messageDraft.update({
      where: { id: draftId },
      data: {
        subject: parsed.data.subject,
        body: parsed.data.body,
        version: existing.version + 1,
      },
    })

    await logAction({
      action: "draft.edited",
      entityType: "MessageDraft",
      entityId: draftId,
      actor: ACTOR,
      metadata: { newVersion: existing.version + 1 },
    })

    revalidatePath("/approvals")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update draft" }
  }
}

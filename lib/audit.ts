import { prisma } from './prisma'

export async function logAction(params: {
  action: string
  entityType: string
  entityId: string
  actor: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  const { action, entityType, entityId, actor, metadata } = params

  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      actor,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  })
}

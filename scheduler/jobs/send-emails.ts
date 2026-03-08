import { prisma } from '@/lib/prisma';
import { sendBulk } from '@/mailer';
import { buildEmailHtml } from '@/mailer/templates/awareness-day';
import { logAction } from '@/lib/audit';

const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

/**
 * Process all pending scheduled sends whose sendDate has passed.
 *
 * For each eligible send:
 *   1. Verify the related draft is approved.
 *   2. Query active (non-opted-out) subscribers, applying segmentFilter if set.
 *   3. Send bulk email via SES.
 *   4. Update the ScheduledSend record with sentAt, recipientCount.
 *   5. Mark the draft as "sent".
 *   6. Log the action to the audit trail.
 */
export async function processPendingSends(): Promise<{
  processed: number;
  errors: string[];
}> {
  const now = new Date();
  let processed = 0;
  const errors: string[] = [];

  // Find all scheduled sends that haven't been sent yet and are due
  const pendingSends = await prisma.scheduledSend.findMany({
    where: {
      sentAt: null,
      sendDate: { lte: now },
    },
    include: {
      draft: {
        include: {
          awarenessDay: true,
        },
      },
    },
  });

  for (const scheduledSend of pendingSends) {
    try {
      // Only send if the draft has been approved
      if (scheduledSend.draft.status !== 'approved') {
        continue;
      }

      // Query active subscribers
      let subscribers = await prisma.subscriber.findMany({
        where: { optedOut: false },
      });

      // Apply segment filter if set
      if (scheduledSend.segmentFilter) {
        const requiredSegments: string[] = JSON.parse(scheduledSend.segmentFilter);
        if (requiredSegments.length > 0) {
          subscribers = subscribers.filter((sub) => {
            const subSegments: string[] = JSON.parse(sub.segments);
            return requiredSegments.some((seg) => subSegments.includes(seg));
          });
        }
      }

      if (subscribers.length === 0) {
        await prisma.scheduledSend.update({
          where: { id: scheduledSend.id },
          data: {
            sentAt: now,
            recipientCount: 0,
            errorMessage: 'No active subscribers matched the filter',
          },
        });
        continue;
      }

      // Build the email HTML for each recipient and send
      const recipients = subscribers.map((sub) => ({
        email: sub.email,
        name: sub.name ?? undefined,
      }));

      // Build a single HTML body (personalisation is done via the template greeting)
      const htmlBody = buildEmailHtml({
        subject: scheduledSend.draft.subject,
        body: scheduledSend.draft.body,
        subscriberName: '', // bulk send uses generic greeting
        unsubscribeUrl: `${APP_URL}/unsubscribe`,
      });

      const result = await sendBulk({
        recipients,
        subject: scheduledSend.draft.subject,
        htmlBody,
      });

      // Update scheduled send record
      await prisma.scheduledSend.update({
        where: { id: scheduledSend.id },
        data: {
          sentAt: now,
          recipientCount: result.sent,
          errorMessage: result.failed > 0
            ? `${result.failed} of ${recipients.length} sends failed`
            : null,
        },
      });

      // Mark the draft as sent
      await prisma.messageDraft.update({
        where: { id: scheduledSend.draftId },
        data: { status: 'sent' },
      });

      // Audit log
      await logAction({
        action: 'email.bulk_sent',
        entityType: 'ScheduledSend',
        entityId: scheduledSend.id,
        actor: 'system:scheduler',
        metadata: {
          draftId: scheduledSend.draftId,
          subject: scheduledSend.draft.subject,
          recipientCount: result.sent,
          failedCount: result.failed,
        },
      });

      processed++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`ScheduledSend ${scheduledSend.id}: ${errorMsg}`);

      // Store the error on the record so it's visible in the dashboard
      await prisma.scheduledSend.update({
        where: { id: scheduledSend.id },
        data: { errorMessage: errorMsg },
      }).catch(() => {
        // Swallow — we already captured the error
      });
    }
  }

  return { processed, errors };
}

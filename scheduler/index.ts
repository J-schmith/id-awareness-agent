import cron from 'node-cron';
import { processPendingSends } from './jobs/send-emails';
import { runResearchScan } from './jobs/research-scan';

/**
 * Start the cron scheduler.
 *
 * Registers two recurring jobs:
 *   - Send emails: every 30 minutes — processes approved drafts that are due.
 *   - Research scan: weekly on Monday at 06:00 — discovers new awareness days.
 */
export function startScheduler(): void {
  console.log('[scheduler] Starting cron scheduler...');

  // ── Send emails — every 30 minutes ────────────────────────────────────────
  cron.schedule('*/30 * * * *', async () => {
    const startedAt = new Date().toISOString();
    console.log(`[scheduler] Running send-emails job at ${startedAt}`);

    try {
      const result = await processPendingSends();
      console.log(
        `[scheduler] send-emails complete: ${result.processed} processed, ${result.errors.length} errors`,
      );
      if (result.errors.length > 0) {
        console.error('[scheduler] send-emails errors:', result.errors);
      }
    } catch (err) {
      console.error('[scheduler] send-emails job failed:', err);
    }
  });

  // ── Research scan — Monday at 06:00 ───────────────────────────────────────
  cron.schedule('0 6 * * 1', async () => {
    const startedAt = new Date().toISOString();
    console.log(`[scheduler] Running research-scan job at ${startedAt}`);

    try {
      await runResearchScan();
      console.log('[scheduler] research-scan complete');
    } catch (err) {
      console.error('[scheduler] research-scan job failed:', err);
    }
  });

  console.log('[scheduler] Cron jobs registered:');
  console.log('  - send-emails:   */30 * * * *  (every 30 min)');
  console.log('  - research-scan: 0 6 * * 1     (Monday 06:00)');
}

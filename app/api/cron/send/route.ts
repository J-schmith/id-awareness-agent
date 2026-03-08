import { NextRequest, NextResponse } from 'next/server';
import { processPendingSends } from '@/scheduler/jobs/send-emails';

/**
 * POST /api/cron/send
 *
 * Fallback HTTP trigger for processing pending email sends.
 * Secured via a CRON_SECRET header so it can be called by external cron
 * services (e.g. Railway cron, Vercel cron, or an uptime monitor).
 *
 * Headers:
 *   x-cron-secret: <CRON_SECRET env var>
 */
export async function POST(request: NextRequest) {
  // Verify the cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[cron/send] CRON_SECRET environment variable is not set');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 },
    );
  }

  const providedSecret = request.headers.get('x-cron-secret');
  if (providedSecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processPendingSends();

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      errors: result.errors,
    });
  } catch (err) {
    console.error('[cron/send] Failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Next.js instrumentation hook.
 *
 * This file is automatically loaded by Next.js when the server starts.
 * We use it to bootstrap the cron scheduler in the Node.js runtime,
 * so that scheduled jobs run inside the same process as the web server
 * (ideal for Railway / single-container deployments).
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('./scheduler');
    startScheduler();
  }
}

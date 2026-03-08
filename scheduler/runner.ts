/**
 * Standalone entry point for the cron scheduler.
 *
 * Run with:
 *   npx ts-node scheduler/runner.ts
 *
 * Or in production:
 *   node -r tsconfig-paths/register scheduler/runner.js
 *
 * This keeps the process alive so cron jobs continue to fire.
 */

import { startScheduler } from './index';

console.log('[runner] Initialising standalone scheduler process...');

startScheduler();

// Keep the process alive indefinitely
// The cron library uses timers internally, but we add an explicit interval
// as a safety net so Node doesn't exit.
setInterval(() => {
  // heartbeat — intentionally empty
}, 60_000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[runner] Received SIGINT. Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[runner] Received SIGTERM. Shutting down...');
  process.exit(0);
});

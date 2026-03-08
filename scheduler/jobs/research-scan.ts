import { prisma } from '@/lib/prisma';
import { researchAwarenessDays } from '@/agent/research';
import { logAction } from '@/lib/audit';

/**
 * Determine the upcoming quarter string (e.g. "Q2 2026") from the current date.
 */
function getUpcomingQuarter(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();

  // Current quarter: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec
  const currentQ = Math.floor(month / 3) + 1;

  // Target the *next* quarter so we research ahead of time
  let targetQ = currentQ + 1;
  let targetYear = year;
  if (targetQ > 4) {
    targetQ = 1;
    targetYear = year + 1;
  }

  return `Q${targetQ} ${targetYear}`;
}

/**
 * Get the start and end dates for a quarter string like "Q2 2026".
 */
function quarterDateRange(quarter: string): { start: Date; end: Date } {
  const match = quarter.match(/Q(\d)\s+(\d{4})/);
  if (!match) throw new Error(`Invalid quarter format: ${quarter}`);

  const q = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  const startMonth = (q - 1) * 3; // 0-indexed

  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);

  return { start, end };
}

/**
 * Run the AI research scan to discover awareness days for the upcoming quarter.
 *
 * Steps:
 *   1. Determine the upcoming quarter from the current date.
 *   2. Load all active themes.
 *   3. Load existing awareness days for that period (to avoid duplicates).
 *   4. Call the Claude-powered research agent.
 *   5. Upsert each result as an AwarenessDay with status "discovered".
 *   6. Log to audit.
 */
export async function runResearchScan(): Promise<void> {
  const quarter = getUpcomingQuarter();
  const { start, end } = quarterDateRange(quarter);

  console.log(`[research-scan] Scanning for awareness days in ${quarter} (${start.toISOString()} - ${end.toISOString()})`);

  // Load active themes
  const themes = await prisma.theme.findMany({
    where: { active: true },
  });

  if (themes.length === 0) {
    console.log('[research-scan] No active themes found. Skipping.');
    return;
  }

  // Load existing awareness days in the target quarter to avoid duplicates
  const existingDays = await prisma.awarenessDay.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    select: { name: true },
  });

  const existingNames = existingDays.map((d) => d.name);

  // Run the AI research agent
  const results = await researchAwarenessDays({
    quarter,
    themes: themes.map((t) => ({ id: t.id, label: t.label })),
    existingDays: existingNames,
  });

  console.log(`[research-scan] Discovered ${results.length} awareness days`);

  // Upsert each discovered day
  let upserted = 0;
  for (const result of results) {
    // Find the matching theme by label
    const theme = themes.find((t) => t.label === result.themeLabel);
    if (!theme) {
      console.warn(`[research-scan] No matching theme for label "${result.themeLabel}", skipping ${result.name}`);
      continue;
    }

    const dateObj = new Date(result.date);
    if (isNaN(dateObj.getTime())) {
      console.warn(`[research-scan] Invalid date "${result.date}" for ${result.name}, skipping`);
      continue;
    }

    // Upsert by name + date to avoid duplicates
    await prisma.awarenessDay.upsert({
      where: {
        id: '', // Prisma requires a unique field — we'll use create/update pattern below
      },
      create: {
        name: result.name,
        date: dateObj,
        themeId: theme.id,
        sourceUrl: result.sourceUrl,
        sourceNotes: result.description,
        status: 'discovered',
      },
      update: {
        sourceUrl: result.sourceUrl,
        sourceNotes: result.description,
      },
    }).catch(async () => {
      // If upsert fails (no unique constraint on name), try find-or-create
      const existing = await prisma.awarenessDay.findFirst({
        where: {
          name: result.name,
          date: dateObj,
        },
      });

      if (existing) {
        await prisma.awarenessDay.update({
          where: { id: existing.id },
          data: {
            sourceUrl: result.sourceUrl,
            sourceNotes: result.description,
          },
        });
      } else {
        await prisma.awarenessDay.create({
          data: {
            name: result.name,
            date: dateObj,
            themeId: theme.id,
            sourceUrl: result.sourceUrl,
            sourceNotes: result.description,
            status: 'discovered',
          },
        });
      }
    });

    upserted++;
  }

  // Audit log
  await logAction({
    action: 'agent.research_scan_completed',
    entityType: 'Agent',
    entityId: 'research-scan',
    actor: 'system:scheduler',
    metadata: {
      quarter,
      themesScanned: themes.length,
      resultsFound: results.length,
      daysUpserted: upserted,
    },
  });

  console.log(`[research-scan] Scan complete. Upserted ${upserted} awareness days.`);
}

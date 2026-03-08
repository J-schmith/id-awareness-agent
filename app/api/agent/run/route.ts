import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { researchAwarenessDays } from '@/agent/research';
import { generateDraft } from '@/agent/draft';
import { logAction } from '@/lib/audit';

/**
 * POST /api/agent/run
 *
 * Trigger the AI agent to research awareness days and/or generate drafts.
 * Runs the pipeline in the background and returns 202 Accepted immediately.
 *
 * Body:
 *   { "themeIds"?: string[], "quarter"?: string }
 */
export async function POST(request: NextRequest) {
  // Verify auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const actor = (session.user as { email?: string }).email ?? 'unknown';

  let body: { themeIds?: string[]; quarter?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { themeIds, quarter } = body;

  // Determine the quarter (default to next quarter)
  const resolvedQuarter = quarter ?? getDefaultQuarter();

  // Log the run start
  const runId = crypto.randomUUID();

  await logAction({
    action: 'agent.run_started',
    entityType: 'Agent',
    entityId: runId,
    actor,
    metadata: { themeIds, quarter: resolvedQuarter },
  });

  // Run the pipeline in the background (don't await)
  runPipeline(runId, resolvedQuarter, themeIds, actor).catch((err) => {
    console.error(`[agent/run] Pipeline failed for run ${runId}:`, err);
  });

  return NextResponse.json(
    {
      message: 'Agent run started',
      runId,
      quarter: resolvedQuarter,
    },
    { status: 202 },
  );
}

// ---------------------------------------------------------------------------
// Background pipeline
// ---------------------------------------------------------------------------

async function runPipeline(
  runId: string,
  quarter: string,
  themeIds: string[] | undefined,
  actor: string,
): Promise<void> {
  // Load themes
  const themes = await prisma.theme.findMany({
    where: {
      active: true,
      ...(themeIds && themeIds.length > 0 ? { id: { in: themeIds } } : {}),
    },
  });

  if (themes.length === 0) {
    console.warn(`[agent/run] No active themes found for run ${runId}`);
    return;
  }

  // Parse quarter date range
  const { start, end } = quarterDateRange(quarter);

  // Load existing days in the quarter
  const existingDays = await prisma.awarenessDay.findMany({
    where: { date: { gte: start, lte: end } },
    select: { name: true },
  });

  // ── Step 1: Research ────────────────────────────────────────────────────
  const results = await researchAwarenessDays({
    quarter,
    themes: themes.map((t) => ({ id: t.id, label: t.label })),
    existingDays: existingDays.map((d) => d.name),
  });

  // Upsert discovered days
  const createdDays: { id: string; name: string; date: Date; theme: { label: string }; sourceUrl?: string | null; sourceNotes?: string | null }[] = [];

  for (const result of results) {
    const theme = themes.find((t) => t.label === result.themeLabel);
    if (!theme) continue;

    const dateObj = new Date(result.date);
    if (isNaN(dateObj.getTime())) continue;

    // Find-or-create
    let day = await prisma.awarenessDay.findFirst({
      where: { name: result.name, date: dateObj },
    });

    if (!day) {
      day = await prisma.awarenessDay.create({
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

    createdDays.push({
      id: day.id,
      name: day.name,
      date: day.date,
      theme: { label: theme.label },
      sourceUrl: day.sourceUrl,
      sourceNotes: day.sourceNotes,
    });
  }

  // ── Step 2: Draft generation ────────────────────────────────────────────
  // Generate drafts for confirmed days that don't have one yet
  const confirmedDaysWithoutDraft = await prisma.awarenessDay.findMany({
    where: {
      date: { gte: start, lte: end },
      status: 'confirmed',
      messageDrafts: { none: {} },
    },
    include: { theme: true },
  });

  let draftsGenerated = 0;

  for (const day of confirmedDaysWithoutDraft) {
    try {
      const draftResult = await generateDraft({
        name: day.name,
        date: day.date,
        theme: { label: day.theme.label },
        sourceUrl: day.sourceUrl,
        sourceNotes: day.sourceNotes,
      });

      await prisma.messageDraft.create({
        data: {
          awarenessDayId: day.id,
          subject: draftResult.subject,
          body: draftResult.body,
          status: 'pending',
          version: 1,
        },
      });

      draftsGenerated++;
    } catch (err) {
      console.error(`[agent/run] Failed to generate draft for ${day.name}:`, err);
    }
  }

  // Log completion
  await logAction({
    action: 'agent.run_completed',
    entityType: 'Agent',
    entityId: runId,
    actor,
    metadata: {
      quarter,
      daysDiscovered: createdDays.length,
      draftsGenerated,
    },
  });

  console.log(
    `[agent/run] Run ${runId} complete: ${createdDays.length} days discovered, ${draftsGenerated} drafts generated`,
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultQuarter(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const currentQ = Math.floor(month / 3) + 1;

  let targetQ = currentQ + 1;
  let targetYear = year;
  if (targetQ > 4) {
    targetQ = 1;
    targetYear = year + 1;
  }

  return `Q${targetQ} ${targetYear}`;
}

function quarterDateRange(quarter: string): { start: Date; end: Date } {
  const match = quarter.match(/Q(\d)\s+(\d{4})/);
  if (!match) throw new Error(`Invalid quarter format: ${quarter}`);

  const q = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  const startMonth = (q - 1) * 3;

  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);

  return { start, end };
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { csvImportSchema } from '@/lib/validations';
import { logAction } from '@/lib/audit';
import { parse } from 'csv-parse/sync';

/**
 * POST /api/subscribers/import
 *
 * Import subscribers from a CSV file uploaded as multipart form data.
 *
 * Expected CSV columns:
 *   email (required), name (optional), segments (optional, semicolon-separated)
 *
 * Returns the count of imported records and any row-level errors.
 */
export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Expected multipart form data' },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'No file provided. Send a CSV file in the "file" field.' },
      { status: 400 },
    );
  }

  const text = await file.text();
  if (!text.trim()) {
    return NextResponse.json(
      { error: 'CSV file is empty' },
      { status: 400 },
    );
  }

  // Parse CSV
  let records: Record<string, string>[];
  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 },
    );
  }

  if (records.length === 0) {
    return NextResponse.json(
      { error: 'CSV file contains no data rows' },
      { status: 400 },
    );
  }

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const parsed = csvImportSchema.safeParse(row);

    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.errors[0].message}`);
      continue;
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
      });
      imported++;
    } catch (rowErr) {
      errors.push(
        `Row ${i + 1} (${parsed.data.email}): ${rowErr instanceof Error ? rowErr.message : 'Unknown error'}`,
      );
    }
  }

  await logAction({
    action: 'subscriber.bulk_import',
    entityType: 'Subscriber',
    entityId: 'bulk',
    actor: 'api',
    metadata: {
      imported,
      totalRows: records.length,
      errorCount: errors.length,
    },
  });

  return NextResponse.json({
    ok: true,
    imported,
    totalRows: records.length,
    errors,
  });
}

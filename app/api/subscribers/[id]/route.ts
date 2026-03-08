import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subscriberSchema } from '@/lib/validations';
import { logAction } from '@/lib/audit';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/subscribers/:id
 *
 * Fetch a single subscriber by ID.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  const subscriber = await prisma.subscriber.findUnique({ where: { id } });
  if (!subscriber) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...subscriber,
    segments: JSON.parse(subscriber.segments),
  });
}

/**
 * PATCH /api/subscribers/:id
 *
 * Update a subscriber. Accepts partial data.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  const existing = await prisma.subscriber.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Allow partial updates — merge with existing data for validation
  const merged = {
    email: (body as Record<string, unknown>).email ?? existing.email,
    name: (body as Record<string, unknown>).name ?? existing.name,
    segments: (body as Record<string, unknown>).segments ?? JSON.parse(existing.segments),
  };

  const parsed = subscriberSchema.safeParse(merged);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const updated = await prisma.subscriber.update({
    where: { id },
    data: {
      email: parsed.data.email,
      name: parsed.data.name || null,
      segments: JSON.stringify(parsed.data.segments),
    },
  });

  await logAction({
    action: 'subscriber.updated',
    entityType: 'Subscriber',
    entityId: id,
    actor: 'api',
  });

  return NextResponse.json({
    ...updated,
    segments: JSON.parse(updated.segments),
  });
}

/**
 * DELETE /api/subscribers/:id
 *
 * Delete a subscriber.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  const existing = await prisma.subscriber.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }

  await prisma.subscriber.delete({ where: { id } });

  await logAction({
    action: 'subscriber.deleted',
    entityType: 'Subscriber',
    entityId: id,
    actor: 'api',
  });

  return NextResponse.json({ ok: true });
}

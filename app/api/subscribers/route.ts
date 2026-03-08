import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subscriberSchema } from '@/lib/validations';
import { logAction } from '@/lib/audit';

/**
 * GET /api/subscribers
 *
 * List subscribers with pagination and optional search.
 *
 * Query params:
 *   page  — page number (default 1)
 *   limit — items per page (default 20, max 100)
 *   q     — search term (matches name or email)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const query = searchParams.get('q')?.trim() ?? '';

  const skip = (page - 1) * limit;

  const where = query
    ? {
        OR: [
          { email: { contains: query } },
          { name: { contains: query } },
        ],
      }
    : {};

  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscriber.count({ where }),
  ]);

  return NextResponse.json({
    data: subscribers.map((sub) => ({
      ...sub,
      segments: JSON.parse(sub.segments),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * POST /api/subscribers
 *
 * Create a new subscriber. Body is validated with Zod.
 *
 * Body:
 *   { "email": string, "name"?: string, "segments"?: string[] }
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = subscriberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Check for duplicate email
  const existing = await prisma.subscriber.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'A subscriber with this email already exists' },
      { status: 409 },
    );
  }

  const subscriber = await prisma.subscriber.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name || null,
      segments: JSON.stringify(parsed.data.segments),
    },
  });

  await logAction({
    action: 'subscriber.created',
    entityType: 'Subscriber',
    entityId: subscriber.id,
    actor: 'api',
  });

  return NextResponse.json(
    {
      ...subscriber,
      segments: JSON.parse(subscriber.segments),
    },
    { status: 201 },
  );
}
